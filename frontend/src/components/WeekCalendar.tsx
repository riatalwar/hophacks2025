import { useState, useRef, useEffect } from 'react';
import '../styles/PreferencesWeekCalendar.css';

interface TimeBlock {
  id: string;
  day: number; // 0 = Monday, 1 = Tuesday, etc.
  startTime: number; // minutes from midnight
  endTime: number; // minutes from midnight
  type: 'study' | 'wake' | 'bedtime';
}

interface WeekCalendarProps {
  onScheduleChange: (schedule: TimeBlock[]) => void;
}

export function WeekCalendar({ onScheduleChange }: WeekCalendarProps) {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [wakeUpTimes, setWakeUpTimes] = useState<{ [day: number]: TimeBlock | null }>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createStart, setCreateStart] = useState<{ day: number; time: number } | null>(null);
  const [selectedButton, setSelectedButton] = useState<'wake' | 'bedtime' | 'study' | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = Array.from({ length: 48 }, (_, i) => i); // 48 slots for 30-minute intervals

  // Constants
  const HOUR_HEIGHT = 40;
  const HALF_HOUR_HEIGHT = 20; // Half of hour height for 30-minute intervals
  const DAYS_COUNT = 7;

  // Helper functions
  const timeToPosition = (time: number) => (time / 30) * HALF_HOUR_HEIGHT; // 30-minute intervals
  const positionToTime = (position: number) => Math.round((position / HALF_HOUR_HEIGHT) * 30); // 30-minute intervals
  
  const dayToPosition = (day: number) => {
    if (!calendarRef.current) return 0;
    const gridWidth = calendarRef.current.offsetWidth - 60; // Subtract time column width
    return (day * gridWidth) / DAYS_COUNT;
  };

  const formatTime = (minutes: number) => {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    
    // Handle 12 AM/PM format
    let displayHour = hour;
    if (hour === 0) displayHour = 12;
    else if (hour > 12) displayHour = hour - 12;
    
    const period = hour < 12 ? 'AM' : 'PM';
    
    // Always show minutes with zero-padding
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  // Button selection handlers
  const handleButtonSelect = (buttonType: 'wake' | 'bedtime' | 'study') => {
    setSelectedButton(selectedButton === buttonType ? null : buttonType);
  };

  const getGridDimensions = () => {
    if (!calendarRef.current) return { dayWidth: 0, gridWidth: 0 };
    const gridWidth = calendarRef.current.offsetWidth - 60;
    return { dayWidth: gridWidth / DAYS_COUNT, gridWidth };
  };

  // Mouse event handlers
  const handleCellHover = (e: React.MouseEvent, _day: number, _slot: number) => {
    if (!selectedButton || selectedButton !== 'wake') return;
    
    // Add visual feedback for hover
    const cell = e.currentTarget as HTMLElement;
    cell.style.backgroundColor = 'rgba(255, 165, 0, 0.1)';
    
    // Remove hover effect after a short delay
    setTimeout(() => {
      cell.style.backgroundColor = '';
    }, 100);
  };

  const handleMouseDown = (e: React.MouseEvent, day: number, slot: number) => {
    if (e.target !== e.currentTarget || !selectedButton) return;
    
    if (selectedButton === 'wake') {
      // Convert slot to minutes (30-minute intervals)
      const startTime = slot * 30; // Convert slot to minutes
      const endTime = startTime + 10; // 10 minutes
      
      const newWakeTime: TimeBlock = {
        id: `wake-${day}-${Date.now()}`,
        day,
        startTime,
        endTime,
        type: 'wake'
      };

      setWakeUpTimes(prev => ({
        ...prev,
        [day]: newWakeTime
      }));
    } else if (selectedButton === 'study') {
      // For study times, use the original drag behavior
      setIsCreating(true);
      setCreateStart({ day, time: slot });
    }
    
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isCreating || !createStart || !calendarRef.current || selectedButton !== 'study') return;

    const rect = calendarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { dayWidth } = getGridDimensions();

    // Calculate day based on grid position (accounting for 60px time column offset)
    const gridX = x - 60; // Subtract time column width
    const day = Math.floor(gridX / dayWidth);
    
    // Calculate time based on grid position (accounting for header offset)
    const gridY = y - 60; // Subtract header height
    const time = Math.max(0, Math.min(23, Math.floor(gridY / HOUR_HEIGHT)));

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
    if (!selectedButton) return;
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

  const deleteWakeTime = (day: number) => {
    setWakeUpTimes(prev => ({
      ...prev,
      [day]: null
    }));
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
        <p>Click on the buttons below to set your wake up times, bedtimes, and valid study times</p>
      </div>
      
      {/* Schedule Control Buttons */}
      <div className="preferences-schedule-buttons">
        <button 
          className={`preferences-schedule-button ${selectedButton === 'wake' ? 'selected' : ''}`}
          onClick={() => handleButtonSelect('wake')}
        >
          Wake Up Times
        </button>
        <button 
          className={`preferences-schedule-button ${selectedButton === 'bedtime' ? 'selected' : ''}`}
          onClick={() => handleButtonSelect('bedtime')}
        >
          Bedtimes
        </button>
        <button 
          className={`preferences-schedule-button ${selectedButton === 'study' ? 'selected' : ''}`}
          onClick={() => handleButtonSelect('study')}
        >
          Valid Study Times
        </button>
      </div>
      
      <div 
        className={`preferences-week-calendar ${!selectedButton ? 'disabled' : ''}`}
        ref={calendarRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Time column */}
        <div className="preferences-time-column">
          {timeSlots.map(slot => (
            <div key={slot} className="preferences-time-slot">
              {formatTime(slot * 30)}
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
                {timeSlots.map(slot => (
                  <div
                    key={`${dayIndex}-${slot}`}
                    className="preferences-time-cell"
                    onMouseDown={(e) => handleMouseDown(e, dayIndex, slot)}
                    onMouseMove={(e) => handleCellHover(e, dayIndex, slot)}
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
                left: dayToPosition(block.day), // No additional offset needed - grid already accounts for time column
                top: timeToPosition(block.startTime), // No additional offset - grid cells have margin-top
                height: timeToPosition(block.endTime - block.startTime),
                width: getGridDimensions().dayWidth
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

          {/* Wake up time blocks */}
          {Object.entries(wakeUpTimes).map(([day, wakeTime]) => {
            if (!wakeTime) return null;
            return (
              <div
                key={wakeTime.id}
                className={`preferences-time-block ${wakeTime.type}`}
                style={{
                  left: dayToPosition(parseInt(day)), // No additional offset needed - grid already accounts for time column
                  top: timeToPosition(wakeTime.startTime), // No additional offset - grid cells have margin-top
                  height: timeToPosition(wakeTime.endTime - wakeTime.startTime),
                  width: getGridDimensions().dayWidth
                }}
              >
                <div className="preferences-block-content">
                  <span className="preferences-block-time">
                    Wake Up
                  </span>
                  <button 
                    className="preferences-delete-block"
                    onClick={() => deleteWakeTime(parseInt(day))}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}