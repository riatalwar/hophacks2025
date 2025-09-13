import React, { useState, useRef, useEffect } from 'react';
import '../styles/PreferencesWeekCalendar.css';

interface TimeBlock {
  id: string;
  day: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: number; // minutes from midnight
  endTime: number; // minutes from midnight
  type: 'study' | 'wake' | 'sleep';
}

interface WeekCalendarProps {
  onScheduleChange: (schedule: TimeBlock[]) => void;
}

export function WeekCalendar({ onScheduleChange }: WeekCalendarProps) {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createStart, setCreateStart] = useState<{ day: number; time: number } | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  // Convert time to grid position
  const timeToPosition = (time: number) => (time / 60) * 40 + 60; // 40px per hour + 60px header offset
  const positionToTime = (position: number) => Math.round(((position - 60) / 40) * 60); // Account for header offset

  // Convert day to grid position - now using percentage-based width
  const dayToPosition = (day: number) => {
    if (!calendarRef.current) return 0;
    const gridWidth = calendarRef.current.offsetWidth - 60; // Subtract time column width
    const dayWidth = gridWidth / 7; // Divide by 7 days
    return day * dayWidth;
  };

  const handleMouseDown = (e: React.MouseEvent, day: number, time: number) => {
    if (e.target !== e.currentTarget) return; // Only start creating if clicking on empty space
    
    setIsCreating(true);
    setCreateStart({ day, time });
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isCreating || !createStart || !calendarRef.current) return;

    const rect = calendarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate which day and time we're hovering over
    const gridWidth = calendarRef.current.offsetWidth - 60; // Subtract time column width
    const dayWidth = gridWidth / 7; // Divide by 7 days
    const day = Math.floor(x / dayWidth);
    const time = Math.max(0, Math.min(23, Math.floor((y - 60) / 40))); // Account for header offset

    if (day >= 0 && day <= 6 && time !== createStart.time) {
      // Create a temporary study block
      const startTime = Math.min(createStart.time, time) * 60;
      const endTime = Math.max(createStart.time, time) * 60;
      
      const newBlock: TimeBlock = {
        id: `temp-${Date.now()}`,
        day: createStart.day,
        startTime,
        endTime,
        type: 'study'
      };

      // Update the temporary block
      setTimeBlocks(prev => {
        const filtered = prev.filter(block => !block.id.startsWith('temp-'));
        return [...filtered, newBlock];
      });
    }
  };

  const handleMouseUp = () => {
    if (isCreating && createStart) {
      // Finalize the block
      setTimeBlocks(prev => {
        const filtered = prev.filter(block => !block.id.startsWith('temp-'));
        const finalBlock = prev.find(block => block.id.startsWith('temp-'));
        if (finalBlock) {
          const permanentBlock = {
            ...finalBlock,
            id: `block-${Date.now()}-${Math.random()}`
          };
          onScheduleChange([...filtered, permanentBlock]);
          return [...filtered, permanentBlock];
        }
        return filtered;
      });
    }
    setIsCreating(false);
    setCreateStart(null);
  };

  const handleBlockMouseDown = (e: React.MouseEvent, blockId: string) => {
    setDragging(blockId);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };

  const handleBlockMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !dragStart || !calendarRef.current) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    // Update block position
    setTimeBlocks(prev => prev.map(block => {
      if (block.id === dragging) {
        const gridWidth = calendarRef.current!.offsetWidth - 60; // Subtract time column width
        const dayWidth = gridWidth / 7; // Divide by 7 days
        const newDay = Math.max(0, Math.min(6, Math.round((dayToPosition(block.day) + deltaX) / dayWidth)));
        const newStartTime = Math.max(0, Math.min(1380, positionToTime(timeToPosition(block.startTime) + deltaY)));
        const duration = block.endTime - block.startTime;
        
        return {
          ...block,
          day: newDay,
          startTime: newStartTime,
          endTime: Math.min(1440, newStartTime + duration)
        };
      }
      return block;
    }));
  };

  const handleBlockMouseUp = () => {
    if (dragging) {
      onScheduleChange(timeBlocks);
    }
    setDragging(null);
    setDragStart(null);
  };

  const deleteBlock = (blockId: string) => {
    const updatedBlocks = timeBlocks.filter(block => block.id !== blockId);
    setTimeBlocks(updatedBlocks);
    onScheduleChange(updatedBlocks);
  };

  const addWakeTime = (day: number, time: number) => {
    const wakeBlock: TimeBlock = {
      id: `wake-${day}-${Date.now()}`,
      day,
      startTime: time * 60,
      endTime: time * 60 + 30, // 30 minute block
      type: 'wake'
    };
    
    const updatedBlocks = [...timeBlocks.filter(block => !(block.day === day && block.type === 'wake')), wakeBlock];
    setTimeBlocks(updatedBlocks);
    onScheduleChange(updatedBlocks);
  };

  const addSleepTime = (day: number, time: number) => {
    const sleepBlock: TimeBlock = {
      id: `sleep-${day}-${Date.now()}`,
      day,
      startTime: time * 60,
      endTime: time * 60 + 30, // 30 minute block
      type: 'sleep'
    };
    
    const updatedBlocks = [...timeBlocks.filter(block => !(block.day === day && block.type === 'sleep')), sleepBlock];
    setTimeBlocks(updatedBlocks);
    onScheduleChange(updatedBlocks);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      handleMouseUp();
      handleBlockMouseUp();
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isCreating, dragging]);

  return (
    <div className="preferences-week-calendar-container">
      <div className="preferences-calendar-header">
        <h3>Weekly Study Schedule</h3>
        <p>Drag to create study blocks, click on wake/sleep times to set them</p>
      </div>
      
      <div 
        className="preferences-week-calendar" 
        ref={calendarRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Time column */}
        <div className="preferences-time-column">
          {timeSlots.map(hour => (
            <div key={hour} className="preferences-time-slot">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
          ))}
        </div>

        {/* Days and grid */}
        <div className="preferences-calendar-grid">
          {/* Days header */}
          <div className="preferences-days-header">
            {days.map((day, index) => (
              <div key={day} className="preferences-day-header">
                <div className="preferences-day-name">{day}</div>
                <div className="preferences-day-controls">
                  <button 
                    className="preferences-time-button preferences-wake-button"
                    onClick={() => addWakeTime(index, 7)} // Default 7 AM
                    title="Set wake time"
                  >
                    ☀️
                  </button>
                  <button 
                    className="preferences-time-button preferences-sleep-button"
                    onClick={() => addSleepTime(index, 23)} // Default 11 PM
                    title="Set bedtime"
                  >
                    🌙
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Grid cells */}
          <div className="preferences-grid-cells">
            {days.map((_, dayIndex) => (
              <div key={dayIndex} className="preferences-day-column">
                {timeSlots.map(hour => (
                  <div
                    key={`${dayIndex}-${hour}`}
                    className="preferences-time-cell"
                    onMouseDown={(e) => handleMouseDown(e, dayIndex, hour)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Time blocks */}
          {timeBlocks.map(block => (
            <div
              key={block.id}
              className={`preferences-time-block ${block.type}`}
              style={{
                left: dayToPosition(block.day),
                top: timeToPosition(block.startTime),
                height: timeToPosition(block.endTime - block.startTime),
                width: 100
              }}
              onMouseDown={(e) => handleBlockMouseDown(e, block.id)}
              onMouseMove={handleBlockMouseMove}
            >
              <div className="preferences-block-content">
                <span className="preferences-block-time">
                  {Math.floor(block.startTime / 60) === 0 ? '12 AM' : 
                   Math.floor(block.startTime / 60) < 12 ? `${Math.floor(block.startTime / 60)} AM` :
                   Math.floor(block.startTime / 60) === 12 ? '12 PM' : 
                   `${Math.floor(block.startTime / 60) - 12} PM`}
                </span>
                <button 
                  className="preferences-delete-block"
                  onClick={() => deleteBlock(block.id)}
                  title="Delete"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
