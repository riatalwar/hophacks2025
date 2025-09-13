import { useState, useRef, useEffect } from 'react';
import '../styles/PreferencesWeekCalendar.css';

interface TimeBlock {
  id: string;
  day: number; // 0 = Monday, 1 = Tuesday, etc.
  startTime: number; // minutes from midnight
  endTime: number; // minutes from midnight
  type: 'study';
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

  // Constants
  const HOUR_HEIGHT = 40;
  const HEADER_OFFSET = 60;
  const DAYS_COUNT = 7;

  // Helper functions
  const timeToPosition = (time: number) => (time / 60) * HOUR_HEIGHT + HEADER_OFFSET;
  const positionToTime = (position: number) => Math.round(((position - HEADER_OFFSET) / HOUR_HEIGHT) * 60);
  
  const dayToPosition = (day: number) => {
    if (!calendarRef.current) return 0;
    const gridWidth = calendarRef.current.offsetWidth - 60;
    return (day * gridWidth) / DAYS_COUNT;
  };

  const formatTime = (minutes: number) => {
    const hour = Math.floor(minutes / 60);
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const getGridDimensions = () => {
    if (!calendarRef.current) return { dayWidth: 0, gridWidth: 0 };
    const gridWidth = calendarRef.current.offsetWidth - 60;
    return { dayWidth: gridWidth / DAYS_COUNT, gridWidth };
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent, day: number, time: number) => {
    if (e.target !== e.currentTarget) return;
    setIsCreating(true);
    setCreateStart({ day, time });
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isCreating || !createStart || !calendarRef.current) return;

    const rect = calendarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { dayWidth } = getGridDimensions();

    const day = Math.floor(x / dayWidth);
    const time = Math.max(0, Math.min(23, Math.floor((y - HEADER_OFFSET) / HOUR_HEIGHT)));

    if (day >= 0 && day <= 6 && time !== createStart.time) {
      const startTime = Math.min(createStart.time, time) * 60;
      const endTime = Math.max(createStart.time, time) * 60;
      
      const newBlock: TimeBlock = {
        id: `temp-${Date.now()}`,
        day: createStart.day,
        startTime,
        endTime,
        type: 'study'
      };

      setTimeBlocks(prev => {
        const filtered = prev.filter(block => !block.id.startsWith('temp-'));
        return [...filtered, newBlock];
      });
    }
  };

  const handleMouseUp = () => {
    if (isCreating && createStart) {
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
    const { dayWidth } = getGridDimensions();

    setTimeBlocks(prev => prev.map(block => {
      if (block.id === dragging) {
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

  // Global mouse up handler
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
        <p>Drag to create study blocks</p>
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
              {formatTime(hour * 60)}
            </div>
          ))}
        </div>

        {/* Days and grid */}
        <div className="preferences-calendar-grid">
          {/* Days header */}
          <div className="preferences-days-header">
            {days.map((day) => (
              <div key={day} className="preferences-day-header">
                <div className="preferences-day-name">{day}</div>
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
                  {formatTime(block.startTime)}
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