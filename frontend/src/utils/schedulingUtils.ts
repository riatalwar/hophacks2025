import { TimeBlock, BusyTimeList, BusyTimeNode } from '../types/scheduling';

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