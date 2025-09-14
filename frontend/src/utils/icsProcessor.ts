import ICAL from 'ical.js';
import type { TimeBlock } from '@shared/types/activities';

export interface ProcessedICSEvent {
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  isRecurring: boolean;
  rrule?: string;
}

export interface ICSProcessResult {
  success: boolean;
  events: ProcessedICSEvent[];
  timeBlocks: TimeBlock[];
  message: string;
  totalEvents: number;
}

/**
 * Processes ICS file content and extracts calendar events
 */
export async function processICSFile(file: File): Promise<ICSProcessResult> {
  try {
    // Read file content
    const content = await file.text();

    // Parse ICS data
    const jcalData = ICAL.parse(content);
    const comp = new ICAL.Component(jcalData);

    const vevents = comp.getAllSubcomponents('vevent');
    const processedEvents: ProcessedICSEvent[] = [];
    const timeBlocks: TimeBlock[] = [];

    for (const vevent of vevents) {
      const event = new ICAL.Event(vevent);

      // Extract basic event info
      const summary = event.summary || 'Untitled Event';
      const description = event.description || '';
      const location = event.location || '';

      // Handle recurring events
      const isRecurring = !!event.rrule;
      let eventInstances: { start: Date; end: Date }[] = [];

      if (isRecurring && event.rrule) {
        // Generate instances for the next 4 months
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 4);

        const iterator = event.iterator();
        let occurrence = iterator.next();

        while (occurrence && occurrence.toJSDate() < endDate) {
          const startTime = occurrence.toJSDate();
          const duration = event.endDate.toJSDate().getTime() - event.startDate.toJSDate().getTime();
          const endTime = new Date(startTime.getTime() + duration);

          eventInstances.push({ start: startTime, end: endTime });
          occurrence = iterator.next();

          // Safety limit
          if (eventInstances.length > 200) break;
        }
      } else {
        // Single event
        eventInstances.push({
          start: event.startDate.toJSDate(),
          end: event.endDate.toJSDate()
        });
      }

      // Create processed event
      const processedEvent: ProcessedICSEvent = {
        title: summary,
        start: event.startDate.toJSDate(),
        end: event.endDate.toJSDate(),
        description,
        location,
        isRecurring,
        rrule: event.rrule?.toString()
      };

      processedEvents.push(processedEvent);

      // Convert to TimeBlocks for each instance
      eventInstances.forEach((instance, index) => {
        const timeBlock: TimeBlock = {
          id: `ics-${event.uid}-${index}`,
          day: instance.start.getDay(), // 0=Sunday, 1=Monday, etc.
          startTime: instance.start.getHours() * 60 + instance.start.getMinutes(),
          endTime: instance.end.getHours() * 60 + instance.end.getMinutes(),
          type: categorizeEvent(summary, description, location),
          notes: [summary, location, description].filter(Boolean).join(' - ')
        };

        timeBlocks.push(timeBlock);
      });
    }

    return {
      success: true,
      events: processedEvents,
      timeBlocks,
      message: `Successfully processed ${processedEvents.length} events`,
      totalEvents: processedEvents.length
    };

  } catch (error) {
    console.error('Error processing ICS file:', error);
    return {
      success: false,
      events: [],
      timeBlocks: [],
      message: error instanceof Error ? error.message : 'Failed to process ICS file',
      totalEvents: 0
    };
  }
}

/**
 * Categorizes events based on title, description, and location
 */
function categorizeEvent(title: string, description: string, location: string): TimeBlock['type'] {
  const text = [title, description, location].join(' ').toLowerCase();

  if (text.includes('class') || text.includes('lecture') || text.includes('seminar') ||
      text.includes('lab') || text.includes('tutorial') || text.includes('course')) {
    return 'study';
  }

  if (text.includes('work') || text.includes('job') || text.includes('office') ||
      text.includes('meeting') || text.includes('shift')) {
    return 'study'; // Using 'study' as work equivalent since type only has study/wake/bedtime
  }

  if (text.includes('sleep') || text.includes('bed') || text.includes('rest')) {
    return 'bedtime';
  }

  if (text.includes('wake') || text.includes('alarm') || text.includes('morning')) {
    return 'wake';
  }

  // Default to study for other scheduled events
  return 'study';
}

/**
 * Converts TimeBlocks to the format expected by the backend schedule API
 */
export function convertTimeBlocksForAPI(timeBlocks: TimeBlock[], userId: string) {
  return {
    userId,
    timeBlocks: timeBlocks.map(block => ({
      ...block,
      source: 'ics' as const
    }))
  };
}