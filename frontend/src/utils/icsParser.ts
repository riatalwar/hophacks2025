/**
 * Comprehensive .ics file parser with time rounding and edge case handling
 * Handles various calendar formats, timezones, and edge cases
 */

export interface ParsedEvent {
  id: string;
  summary: string;
  startTime: number; // minutes from midnight
  endTime: number; // minutes from midnight
  day: number; // 0 = Monday, 1 = Tuesday, etc.
  isAllDay: boolean;
  isRecurring: boolean;
  originalStart: string;
  originalEnd: string;
}

export interface ParsedCalendar {
  events: ParsedEvent[];
  timezone: string;
  errors: string[];
  warnings: string[];
}

export interface ParseOptions {
  allowPastEvents?: boolean;
  maxPastYears?: number;
}

/**
 * Round time to nearest 30-minute increment
 * Start times: round down (1:15 -> 1:00)
 * End times: round up (2:45 -> 3:00)
 */
export function roundTimeTo30MinIncrement(timeInMinutes: number, isEndTime: boolean = false): number {
  const minutes = timeInMinutes % 60;
  const hours = Math.floor(timeInMinutes / 60);
  
  if (isEndTime) {
    // Round up for end times
    if (minutes === 0) return timeInMinutes;
    if (minutes <= 30) return hours * 60 + 30;
    return (hours + 1) * 60;
  } else {
    // Round down for start times
    if (minutes < 30) return hours * 60;
    return hours * 60 + 30;
  }
}

/**
 * Convert time string to minutes from midnight
 * Handles various formats: HHMM, HH:MM, HHMMSS, HH:MM:SS
 */
export function parseTimeString(timeStr: string): number {
  if (!timeStr) return 0;
  
  // Remove any non-digit characters except colons
  const cleaned = timeStr.replace(/[^\d:]/g, '');
  
  // Handle different formats
  if (cleaned.includes(':')) {
    // HH:MM or HH:MM:SS format
    const parts = cleaned.split(':');
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours * 60 + minutes;
  } else {
    // HHMM or HHMMSS format
    const padded = cleaned.padStart(4, '0');
    const hours = parseInt(padded.substring(0, 2), 10) || 0;
    const minutes = parseInt(padded.substring(2, 4), 10) || 0;
    return hours * 60 + minutes;
  }
}

/**
 * Convert date string to day of week (0 = Monday, 6 = Sunday)
 */
export function parseDateToDayOfWeek(dateStr: string): number {
  if (!dateStr) return 0;
  
  // Handle YYYYMMDD format
  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1; // Month is 0-indexed
  const day = parseInt(dateStr.substring(6, 8), 10);
  
  const date = new Date(year, month, day);
  const dayOfWeek = date.getDay();
  
  // Convert Sunday (0) to 6, Monday (1) to 0, etc.
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
}

/**
 * Parse duration string (e.g., "PT1H30M", "PT2H", "PT30M")
 */
export function parseDuration(duration: string): number {
  if (!duration || !duration.startsWith('PT')) return 0;
  
  const durationStr = duration.substring(2); // Remove 'PT' prefix
  let totalMinutes = 0;
  
  // Parse hours
  const hourMatch = durationStr.match(/(\d+)H/);
  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1], 10) * 60;
  }
  
  // Parse minutes
  const minuteMatch = durationStr.match(/(\d+)M/);
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1], 10);
  }
  
  return totalMinutes;
}

/**
 * Check if a date is in the past (more than specified years ago)
 */
export function isDateInPast(dateStr: string, maxPastYears: number = 1): boolean {
  if (!dateStr) return true;
  
  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1;
  const day = parseInt(dateStr.substring(6, 8), 10);
  
  const eventDate = new Date(year, month, day);
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - maxPastYears);
  
  return eventDate < cutoffDate;
}

/**
 * Main .ics file parser
 */
export function parseICSFile(content: string, options: ParseOptions = {}): ParsedCalendar {
  const result: ParsedCalendar = {
    events: [],
    timezone: 'UTC',
    errors: [],
    warnings: []
  };

  try {
    // Split content into lines and clean up
    const lines = content.split(/\r?\n/).map(line => line.trim());
    
    let currentEvent: Partial<ParsedEvent> = {};
    let inEvent = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle line continuation (lines starting with space or tab)
      if (line.startsWith(' ') || line.startsWith('\t')) {
        if (inEvent && currentEvent.summary) {
          currentEvent.summary += line.trim();
        }
        continue;
      }
      
      // Skip empty lines and comments
      if (!line || line.startsWith('#')) continue;
      
      // Parse key-value pairs
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;
      
      let key = line.substring(0, colonIndex).toUpperCase();
      let value = line.substring(colonIndex + 1);
      
      // Handle parameters (e.g., DTSTART;TZID=Europe/Berlin:20140102T110000)
      if (key.includes(';')) {
        const parts = key.split(';');
        key = parts[0];
        // Keep the original value as-is for now
      }
      
      
      // Handle different properties
      switch (key) {
        case 'BEGIN':
          if (value === 'VEVENT') {
            inEvent = true;
            currentEvent = {
              id: '',
              summary: '',
              startTime: undefined,
              endTime: undefined,
              day: 0,
              isAllDay: false,
              isRecurring: false,
              originalStart: '',
              originalEnd: ''
            };
          } else if (value === 'VCALENDAR') {
            // Calendar start
          }
          break;
          
        case 'END':
          if (value === 'VEVENT' && inEvent) {
            // Process the completed event
            if (currentEvent.summary && currentEvent.startTime !== undefined && currentEvent.endTime !== undefined) {
              // Skip events in the past (unless allowed by options)
              if (!options.allowPastEvents && currentEvent.originalStart && isDateInPast(currentEvent.originalStart, options.maxPastYears)) {
                result.warnings.push(`Skipped past event: ${currentEvent.summary} (${currentEvent.originalStart})`);
                break;
              }
              
              // Skip all-day events for now (they don't have specific times)
              if (currentEvent.isAllDay) {
                result.warnings.push(`Skipped all-day event: ${currentEvent.summary}`);
                break;
              }
              
              // Validate time range - allow equal times (they'll be fixed by rounding)
              if (currentEvent.startTime > currentEvent.endTime) {
                result.errors.push(`Invalid time range for event: ${currentEvent.summary}`);
                break;
              }
              
              // Round times to 30-minute increments
              const roundedStart = roundTimeTo30MinIncrement(currentEvent.startTime, false);
              const roundedEnd = roundTimeTo30MinIncrement(currentEvent.endTime, true);
              
              // Ensure end time is after start time after rounding
              if (roundedStart >= roundedEnd) {
                result.warnings.push(`Event time too short after rounding: ${currentEvent.summary}`);
                break;
              }
              
              const event: ParsedEvent = {
                id: currentEvent.id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                summary: currentEvent.summary,
                startTime: roundedStart,
                endTime: roundedEnd,
                day: currentEvent.day || 0,
                isAllDay: currentEvent.isAllDay || false,
                isRecurring: currentEvent.isRecurring || false,
                originalStart: currentEvent.originalStart || '',
                originalEnd: currentEvent.originalEnd || ''
              };
              
              result.events.push(event);
            }
            inEvent = false;
            currentEvent = {};
          }
          break;
          
        case 'SUMMARY':
          if (inEvent) {
            currentEvent.summary = value;
          }
          break;
          
        case 'UID':
          if (inEvent) {
            currentEvent.id = value;
          }
          break;
          
        case 'DTSTART':
          if (inEvent) {
            currentEvent.originalStart = value;
            // Check if it's a date-only (all-day event)
            if (value.length === 8) {
              currentEvent.isAllDay = true;
              currentEvent.day = parseDateToDayOfWeek(value);
            } else {
              // Parse date and time - handle timezone parameters
              const datePart = value.substring(0, 8);
              const timePart = value.substring(8);
              
              currentEvent.day = parseDateToDayOfWeek(datePart);
              currentEvent.startTime = parseTimeString(timePart);
            }
          }
          break;
          
        case 'DTEND':
          if (inEvent) {
            currentEvent.originalEnd = value;
            if (value.length === 8) {
              // All-day event
              currentEvent.isAllDay = true;
            } else {
              // Parse date and time - handle timezone parameters
              const timePart = value.substring(8);
              currentEvent.endTime = parseTimeString(timePart);
            }
          }
          break;
          
        case 'DURATION':
          if (inEvent && currentEvent.startTime !== undefined) {
            const durationMinutes = parseDuration(value);
            currentEvent.endTime = currentEvent.startTime + durationMinutes;
          }
          break;
          
        case 'RRULE':
          if (inEvent) {
            currentEvent.isRecurring = true;
            // For now, we'll only import the first occurrence
            // TODO: Implement recurring event expansion
            result.warnings.push(`Recurring event detected (importing first occurrence only): ${currentEvent.summary}`);
          }
          break;
          
        case 'TZID':
          if (!inEvent) {
            result.timezone = value;
          }
          break;
      }
    }
    
    // Sort events by day and start time
    result.events.sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return a.startTime - b.startTime;
    });
    
  } catch (error) {
    result.errors.push(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return result;
}

/**
 * Convert parsed events to busy time blocks for the WeekCalendar
 */
export function convertEventsToBusyTimes(events: ParsedEvent[]): Array<{day: number; startTime: number; endTime: number; summary: string}> {
  return events.map(event => ({
    day: event.day,
    startTime: event.startTime,
    endTime: event.endTime,
    summary: event.summary
  }));
}


/**
 * Validate .ics file content before parsing
 */
export function validateICSContent(content: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!content) {
    errors.push('File is empty');
    return { isValid: false, errors };
  }
  
  if (!content.includes('BEGIN:VCALENDAR')) {
    errors.push('Not a valid .ics file - missing VCALENDAR header');
  }
  
  if (!content.includes('END:VCALENDAR')) {
    errors.push('Not a valid .ics file - missing VCALENDAR footer');
  }
  
  if (!content.includes('BEGIN:VEVENT')) {
    errors.push('No events found in calendar file');
  }
  
  return { isValid: errors.length === 0, errors };
}
