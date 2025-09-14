import { TodoItem } from '../../shared/types/tasks';
import { TimeBlock, BusyTimeList, BusyTimeNode } from '../types/scheduling';

export interface TaskChunk {
  taskId: string;
  title: string;
  duration: number;
  chunkIndex: number;
  totalChunks: number;
}

export interface AvailableTimeSlot {
  start: number;
  end: number;
  duration: number;
}

export function calculateAvailableTimeSlots(busyTimeLists: BusyTimeList[]): AvailableTimeSlot[][] {
  const availableSlots: AvailableTimeSlot[][] = Array(7).fill(null).map(() => []);
  
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const busyList = busyTimeLists[dayIndex];
    const daySlots: AvailableTimeSlot[] = [];
    
    if (!busyList.head) {
      daySlots.push({
        start: 0,
        end: 1440,
        duration: 1440
      });
      availableSlots[dayIndex] = daySlots;
      continue;
    }
    
    const firstBusyNode = busyList.head;
    const firstBusyStart = firstBusyNode.data[0];
    const firstAvailableEnd = Math.max(0, firstBusyStart - 5);
    
    if (firstAvailableEnd > 0 && firstAvailableEnd >= 5) {
      daySlots.push({
        start: 0,
        end: firstAvailableEnd,
        duration: firstAvailableEnd
      });
    }
    
    let currentNode = busyList.head;
    while (currentNode && currentNode.next) {
      const currentEnd = currentNode.data[1];
      const nextStart = currentNode.next.data[0];
      
      const gapStart = currentEnd + 5;
      const gapEnd = nextStart - 5;
      const gapDuration = gapEnd - gapStart;
      
      if (gapDuration >= 5) {
        daySlots.push({
          start: gapStart,
          end: gapEnd,
          duration: gapDuration
        });
      }
      
      currentNode = currentNode.next;
    }
    
    let lastNode = busyList.head;
    while (lastNode.next) {
      lastNode = lastNode.next;
    }
    
    const lastBusyEnd = lastNode.data[1];
    const lastAvailableStart = Math.min(1440, lastBusyEnd + 5);
    
    if (lastAvailableStart < 1440 && (1440 - lastAvailableStart) >= 5) {
      daySlots.push({
        start: lastAvailableStart,
        end: 1440,
        duration: 1440 - lastAvailableStart
      });
    }
    
    availableSlots[dayIndex] = daySlots;
  }
  
  return availableSlots;
}

export function convertTimeBlocksToBusyTimeLists(timeBlocks: TimeBlock[]): BusyTimeList[] {
  const busyTimeLists: BusyTimeList[] = Array(7).fill(null).map(() => ({
    head: null,
    size: 0
  }));

  for (const block of timeBlocks) {
    const dayIndex = block.day;
    const newNode: BusyTimeNode = {
      data: [block.startTime, block.endTime],
      next: null
    };

    const list = busyTimeLists[dayIndex];
    if (!list.head || list.head.data[0] > newNode.data[0]) {
      newNode.next = list.head;
      list.head = newNode;
    } else {
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
  if (task.dueDate === 'TBD') {
    const daysUntilDue = 365;
    const estimatedHours = task.estimatedHours ?? 1;
    return estimatedHours / daysUntilDue;
  }
  
  const dueDate = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const timeDiff = dueDate.getTime() - today.getTime();
  const daysUntilDue = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
  
  const isOverdue = timeDiff < 0;
  
  const estimatedHours = task.estimatedHours ?? 1;
  
  const averageHoursPerDay = estimatedHours / (daysUntilDue > 0 ? daysUntilDue : 1);
  let priority = averageHoursPerDay;
  
  if (isOverdue) {
    priority *= 100;
    return priority;
  }
  
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

export function chunkTask(task: TodoItem): TaskChunk[] {
  const estimatedHours = task.estimatedHours ?? 1;
  const totalMinutes = estimatedHours * 60;
  const maxChunkSize = 60;
  
  const fullChunks = Math.floor(totalMinutes / maxChunkSize);
  const remainder = totalMinutes % maxChunkSize;
  
  const totalChunks = fullChunks + (remainder > 0 ? 1 : 0);
  
  const chunks: TaskChunk[] = [];
  
  for (let i = 0; i < fullChunks; i++) {
    chunks.push({
      taskId: task.id,
      title: task.title,
      duration: maxChunkSize,
      chunkIndex: i + 1,
      totalChunks: totalChunks
    });
  }
  
  if (remainder > 0) {
    chunks.push({
      taskId: task.id,
      title: task.title,
      duration: remainder,
      chunkIndex: fullChunks + 1,
      totalChunks: totalChunks
    });
  }
  
  return chunks;
}
export function prepareSortedTaskChunks(tasks: TodoItem[]): TaskChunk[] {
  // Create a map to store the calculated priority of each parent task
  const taskPriorityMap = new Map<string, number>();
  
  // Calculate each task's priority and store it in the map
  for (const task of tasks) {
    const priority = calculateTaskPriority(task);
    taskPriorityMap.set(task.id, priority);
  }
  
  // Create a flat list of all TaskChunk objects
  const allChunks: TaskChunk[] = [];
  for (const task of tasks) {
    const chunks = chunkTask(task);
    allChunks.push(...chunks);
  }
  
  // Sort the chunks based on the specified criteria
  return allChunks.sort((a, b) => {
    const taskAPriority = taskPriorityMap.get(a.taskId) || 0;
    const taskBPriority = taskPriorityMap.get(b.taskId) || 0;
    
    // Primary sort: parent task priority (descending)
    if (taskAPriority !== taskBPriority) {
      return taskBPriority - taskAPriority;
    }
    
    // Find the parent tasks for tie-breaking
    const taskA = tasks.find(t => t.id === a.taskId);
    const taskB = tasks.find(t => t.id === b.taskId);
    
    // Secondary sort: task priority field (high > medium > low)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const taskAPriorityField = taskA ? priorityOrder[taskA.priority] : 0;
    const taskBPriorityField = taskB ? priorityOrder[taskB.priority] : 0;
    
    if (taskAPriorityField !== taskBPriorityField) {
      return taskBPriorityField - taskAPriorityField;
    }
    
    // Tertiary sort: due date (earliest first)
    if (taskA && taskB) {
      // Handle TBD dates by treating them as far in the future
      if (taskA.dueDate === 'TBD' && taskB.dueDate !== 'TBD') return 1;
      if (taskA.dueDate !== 'TBD' && taskB.dueDate === 'TBD') return -1;
      if (taskA.dueDate === 'TBD' && taskB.dueDate === 'TBD') return 0;
      
      // Compare actual dates
      const dateA = new Date(taskA.dueDate);
      const dateB = new Date(taskB.dueDate);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
    }
    
    // Final sort: by id
    return a.taskId.localeCompare(b.taskId);
  });
}