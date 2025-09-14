import { TodoItem } from '../../shared/types/tasks';
import { TimeBlock, BusyTimeList, BusyTimeNode } from '../types/scheduling';

export interface AvailableTimeSlot {
  start: number;
  end: number;
  duration: number;
}

export function calculateAvailableTimeSlots(busyTimeLists: BusyTimeList[]): AvailableTimeSlot[][] {
  // Initialize result array with 7 empty arrays for each day of the week
  const availableSlots: AvailableTimeSlot[][] = Array(7).fill(null).map(() => []);
  
  // Process each day's busy time list
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const busyList = busyTimeLists[dayIndex];
    const daySlots: AvailableTimeSlot[] = [];
    
    // If there are no busy times, the entire day is available
    if (!busyList.head) {
      daySlots.push({
        start: 0,
        end: 1440, // 24 hours * 60 minutes
        duration: 1440
      });
      availableSlots[dayIndex] = daySlots;
      continue;
    }
    
    // Add available time from start of day to first busy period (with buffer)
    const firstBusyNode = busyList.head;
    const firstBusyStart = firstBusyNode.data[0];
    // Apply 5-minute buffer before first busy period
    const firstAvailableEnd = Math.max(0, firstBusyStart - 5);
    
    if (firstAvailableEnd > 0 && firstAvailableEnd >= 5) { // Minimum 5 minutes
      daySlots.push({
        start: 0,
        end: firstAvailableEnd,
        duration: firstAvailableEnd
      });
    }
    
    // Process gaps between busy periods
    let currentNode = busyList.head;
    while (currentNode && currentNode.next) {
      const currentEnd = currentNode.data[1];
      const nextStart = currentNode.next.data[0];
      
      // Apply 5-minute buffer after current busy period and before next busy period
      const gapStart = currentEnd + 5;
      const gapEnd = nextStart - 5;
      const gapDuration = gapEnd - gapStart;
      
      // Only consider gaps that are at least 5 minutes long
      if (gapDuration >= 5) {
        daySlots.push({
          start: gapStart,
          end: gapEnd,
          duration: gapDuration
        });
      }
      
      currentNode = currentNode.next;
    }
    
    // Add available time from last busy period to end of day (with buffer)
    // Find the last node
    let lastNode = busyList.head;
    while (lastNode.next) {
      lastNode = lastNode.next;
    }
    
    const lastBusyEnd = lastNode.data[1];
    // Apply 5-minute buffer after last busy period
    const lastAvailableStart = Math.min(1440, lastBusyEnd + 5);
    
    if (lastAvailableStart < 1440 && (1440 - lastAvailableStart) >= 5) { // Minimum 5 minutes
      daySlots.push({
        start: lastAvailableStart,
        end: 1440, // 24 hours * 60 minutes
        duration: 1440 - lastAvailableStart
      });
    }
    
    availableSlots[dayIndex] = daySlots;
  }
  
  return availableSlots;
}

export function convertTimeBlocksToBusyTimeLists(timeBlocks: TimeBlock[]): BusyTimeList[] {
  // Initialize 7 BusyTimeList objects, one for each day of the week
  const busyTimeLists: BusyTimeList[] = Array(7).fill(null).map(() => ({
    head: null,
    size: 0
  }));

  // Process each TimeBlock
  for (const block of timeBlocks) {
    const dayIndex = block.day;
    const newNode: BusyTimeNode = {
      data: [block.startTime, block.endTime],
      next: null
    };

    // Insert the new node in the correct position to maintain sorted order
    const list = busyTimeLists[dayIndex];
    if (!list.head || list.head.data[0] > newNode.data[0]) {
      // Insert at the beginning
      newNode.next = list.head;
      list.head = newNode;
    } else {
      // Find the correct position to insert
      let current = list.head;
      while (current.next && current.next.data[0] < newNode.data[0]) {
        current = current.next;
      }
      newNode.next = current.next;
      current.next = newNode;
    }
    
    list.size++;
  }

  return busyTimeLists;
}
export function calculateTaskPriority(task: TodoItem): number {
  // Handle TBD due dates as very far in the future (365 days)
  if (task.dueDate === 'TBD') {
    const daysUntilDue = 365;
    const estimatedHours = task.estimatedHours ?? 1;
    const basePriority = estimatedHours / daysUntilDue;
    
    // No urgency multipliers apply to TBD tasks
    return basePriority;
  }
  
  // Parse the due date
  const dueDate = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time part for comparison
  
  // Calculate days until due
  const timeDiff = dueDate.getTime() - today.getTime();
  const daysUntilDue = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
  
  // Handle overdue tasks
  const isOverdue = timeDiff < 0;
  
  // Default estimated hours to 1 if not provided
  const estimatedHours = task.estimatedHours ?? 1;
  
  // Calculate base priority
  const averageHoursPerDay = estimatedHours / (daysUntilDue > 0 ? daysUntilDue : 1);
  let priority = averageHoursPerDay;
  
  // Apply overdue multiplier
  if (isOverdue) {
    priority *= 100;
    return priority;
  }
  
  // Apply urgency multipliers
  if (estimatedHours < 3 && daysUntilDue <= 1) {
    priority *= 10;
  } else if (estimatedHours < 6 && daysUntilDue <= 2) {
    priority *= 8;
  } else if (estimatedHours < 12 && daysUntilDue <= 3) {
    priority *= 6;
  } else if (estimatedHours < 18 && daysUntilDue <= 4) {
    priority *= 4;
  } else if (daysUntilDue <= 5) {
    priority *= 2;
  }
  
  return priority;
}