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
  const [bedtimes, setBedtimes] = useState<{ [day: number]: TimeBlock | null }>({});
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [resizing, setResizing] = useState<{ blockId: string; handle: 'start' | 'end' } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createStart, setCreateStart] = useState<{ day: number; time: number } | null>(null);
  const [hoverEnd, setHoverEnd] = useState<{ day: number; time: number } | null>(null);
  const [selectedButton, setSelectedButton] = useState<'wake' | 'bedtime' | 'study' | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = Array.from({ length: 48 }, (_, i) => i); // 48 slots for 30-minute intervals

  // Constants
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
    setErrorMessage(''); // Clear any existing error when switching buttons
    
    // Cancel study time creation if switching away from study
    if (isCreating && selectedButton === 'study' && buttonType !== 'study') {
      setIsCreating(false);
      setCreateStart(null);
      setHoverEnd(null);
    }
  };

  // Toggle minimize/maximize
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    // Clear any active states when minimizing
    if (!isMinimized) {
      setSelectedButton(null);
      setIsCreating(false);
      setCreateStart(null);
      setHoverEnd(null);
      setErrorMessage('');
    }
  };

  const getGridDimensions = () => {
    if (!calendarRef.current) return { dayWidth: 0, gridWidth: 0 };
    const gridWidth = calendarRef.current.offsetWidth - 60;
    return { dayWidth: gridWidth / DAYS_COUNT, gridWidth };
  };

  // Mouse event handlers
  const handleCellHover = (e: React.MouseEvent, day: number, slot: number) => {
    if (!selectedButton) return;
    
    // Add visual feedback for hover
    const cell = e.currentTarget as HTMLElement;
    if (selectedButton === 'wake') {
      cell.style.backgroundColor = 'rgba(255, 193, 7, 0.1)'; // Orange for wake up
    } else if (selectedButton === 'bedtime') {
      cell.style.backgroundColor = 'rgba(156, 39, 176, 0.1)'; // Purple for bedtime
    } else if (selectedButton === 'study') {
      if (isCreating && createStart) {
        // Track hover position for dynamic preview
        if (day === createStart.day && slot > createStart.time) {
          const startTime = createStart.time * 30;
          const endTime = slot * 30;
          const validationError = validateStudyTime(day, startTime, endTime);
          
          if (validationError) {
            cell.style.backgroundColor = 'rgba(244, 67, 54, 0.2)'; // Red for invalid
          } else {
            cell.style.backgroundColor = 'rgba(78, 205, 196, 0.2)'; // Accent color for valid
          }
          
          setHoverEnd({ day, time: slot });
        } else {
          cell.style.backgroundColor = 'rgba(78, 205, 196, 0.1)'; // Light accent color
        }
      } else {
        // Show start time selection - check if valid
        const startTime = slot * 30;
        const validationError = validateStudyTime(day, startTime, startTime + 30);
        
        if (validationError) {
          cell.style.backgroundColor = 'rgba(244, 67, 54, 0.1)'; // Light red for invalid
        } else {
          cell.style.backgroundColor = 'rgba(78, 205, 196, 0.1)'; // Light accent color for valid
        }
      }
    }
    
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

      // Validate wake up time
      const error = validateWakeUpBedtime(day, newWakeTime);
      if (error) {
        setErrorMessage(error);
        return;
      }

      setWakeUpTimes(prev => ({
        ...prev,
        [day]: newWakeTime
      }));
      setErrorMessage(''); // Clear error on successful placement
    } else if (selectedButton === 'bedtime') {
      // Convert slot to minutes (30-minute intervals)
      const startTime = slot * 30; // Convert slot to minutes
      const endTime = startTime + 10; // 10 minutes
      
      const newBedtime: TimeBlock = {
        id: `bedtime-${day}-${Date.now()}`,
        day,
        startTime,
        endTime,
        type: 'bedtime'
      };

      // Validate bedtime
      const error = validateWakeUpBedtime(day, undefined, newBedtime);
      if (error) {
        setErrorMessage(error);
        return;
      }

      setBedtimes(prev => ({
        ...prev,
        [day]: newBedtime
      }));
      setErrorMessage(''); // Clear error on successful placement
    } else if (selectedButton === 'study') {
      // Two-click study time creation pattern
      if (!isCreating || !createStart) {
        // First click: set start time
        const startTime = slot * 30; // Convert to minutes
        
        // Validate that wake up and bedtime exist
        const validationError = validateStudyTime(day, startTime, startTime + 30); // Check with minimum duration
        if (validationError) {
          setErrorMessage(validationError);
          return;
        }
        
        setIsCreating(true);
        setCreateStart({ day, time: slot });
        setHoverEnd(null); // Clear any previous hover end
        setErrorMessage(''); // Clear any errors
      } else {
        // Second click: set end time and create block
        const startTime = createStart.time * 30; // Convert to minutes
        const endTime = slot * 30; // Convert to minutes
        
        // Validate that end time is after start time
        if (endTime <= startTime) {
          setErrorMessage('End time must be after start time');
          return;
        }
        
        // Only create if it's the same day
        if (createStart.day !== day) {
          setErrorMessage('Study time blocks must be on the same day');
          return;
        }
        
        // Validate study time placement
        const validationError = validateStudyTime(day, startTime, endTime);
        if (validationError) {
          setErrorMessage(validationError);
          return;
        }
        
        const newStudyTime: TimeBlock = {
          id: `study-${day}-${Date.now()}`,
          day,
          startTime,
          endTime,
          type: 'study'
        };
        
        setTimeBlocks(prev => [...prev, newStudyTime]);
        onScheduleChange([...timeBlocks, newStudyTime]);
        
        // Reset creation state
        setIsCreating(false);
        setCreateStart(null);
        setHoverEnd(null);
        setErrorMessage(''); // Clear any errors
      }
    }
    
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Only handle study time creation preview, not block creation
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
    const time = Math.max(0, Math.min(47, Math.floor(gridY / HALF_HOUR_HEIGHT))); // Use 48 slots for 30-minute intervals

    // Only update hover end if it's the same day and after start time
    if (day === createStart.day && time > createStart.time) {
      const startTime = createStart.time * 30;
      const endTime = time * 30;
      
      // Validate the preview study time
      const validationError = validateStudyTime(day, startTime, endTime);
      if (validationError) {
        setErrorMessage(validationError);
      } else {
        setErrorMessage(''); // Clear error if valid
      }
      
      setHoverEnd({ day, time });
    }
  };

  const handleResizeMouseMove = (e: React.MouseEvent) => {
    if (!resizing || !dragStart || !calendarRef.current) return;

    const rect = calendarRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const time = Math.floor((y - 60) / HALF_HOUR_HEIGHT);

    if (time >= 0 && time < 48) {
      setTimeBlocks(prev => prev.map(block => {
        if (block.id === resizing.blockId) {
          const newTime = time * 30; // Convert to minutes
          
          if (resizing.handle === 'start') {
            // Ensure start time is before end time
            const newStartTime = Math.min(newTime, block.endTime - 30); // Minimum 30 minutes
            return { ...block, startTime: newStartTime };
          } else {
            // Ensure end time is after start time
            const newEndTime = Math.max(newTime, block.startTime + 30); // Minimum 30 minutes
            return { ...block, endTime: newEndTime };
          }
        }
        return block;
      }));
    }
  };

  const handleMouseUp = () => {
    // Handle resize completion
    if (resizing) {
      setResizing(null);
      setDragStart(null);
    }
    
    // Note: Study time creation is handled in handleMouseDown, not here
    // This function only handles cleanup for other operations
  };

  const handleBlockMouseDown = (e: React.MouseEvent, blockId: string) => {
    if (!selectedButton) return;
    setDragging(blockId);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };

  const handleResizeMouseDown = (e: React.MouseEvent, blockId: string, handle: 'start' | 'end') => {
    e.stopPropagation();
    setResizing({ blockId, handle });
    setDragStart({ x: e.clientX, y: e.clientY });
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

  const deleteBedtime = (day: number) => {
    setBedtimes(prev => ({
      ...prev,
      [day]: null
    }));
  };

  // Validation function to check if wake up is before bedtime
  const validateWakeUpBedtime = (day: number, newWakeUp?: TimeBlock, newBedtime?: TimeBlock) => {
    const currentWakeUp = newWakeUp || wakeUpTimes[day];
    const currentBedtime = newBedtime || bedtimes[day];
    
    if (currentWakeUp && currentBedtime) {
      if (currentWakeUp.startTime >= currentBedtime.startTime) {
        return `Wake up time must be before bedtime on ${days[day]}`;
      }
    }
    return null;
  };

  // Validation function to check if study time is valid (between wake up and bedtime)
  const validateStudyTime = (day: number, startTime: number, endTime: number) => {
    const wakeUp = wakeUpTimes[day];
    const bedtime = bedtimes[day];
    
    if (!wakeUp) {
      return `Please set a wake up time for ${days[day]} before creating study blocks`;
    }
    
    if (!bedtime) {
      return `Please set a bedtime for ${days[day]} before creating study blocks`;
    }
    
    if (startTime < wakeUp.startTime) {
      return `Study time cannot start before wake up time (${formatTime(wakeUp.startTime)}) on ${days[day]}`;
    }
    
    if (endTime > bedtime.startTime) {
      return `Study time cannot end after bedtime (${formatTime(bedtime.startTime)}) on ${days[day]}`;
    }
    
    return null;
  };

  // Global mouse up handler
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      handleMouseUp();
      handleBlockMouseUp();
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isCreating, dragging, resizing]);

  // Escape key handler to cancel study time creation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCreating && selectedButton === 'study') {
        setIsCreating(false);
        setCreateStart(null);
        setHoverEnd(null);
        setErrorMessage('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCreating, selectedButton]);

  return (
    <div className={`preferences-week-calendar-container ${isMinimized ? 'minimized' : ''}`}>
      <div className="preferences-calendar-header">
        <div className="preferences-header-content">
          <div className="preferences-header-text">
            <h3>Weekly Study Schedule</h3>
            <p>Click on the buttons below to set your wake up times, bedtimes, and valid study times</p>
          </div>
          <button 
            className="preferences-minimize-button"
            onClick={toggleMinimize}
            title={isMinimized ? "Expand calendar" : "Minimize calendar"}
          >
            {isMinimized ? "▼" : "▲"}
          </button>
        </div>
      </div>
      
      {/* Schedule Control Buttons - only show when not minimized */}
      {!isMinimized && (
        <>
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

          {/* Error message */}
          {errorMessage && (
            <div className="preferences-error-message">
              {errorMessage}
            </div>
          )}
        </>
      )}
      
      {!isMinimized && (
        <div 
          className={`preferences-week-calendar ${!selectedButton ? 'disabled' : ''}`}
          ref={calendarRef}
          onMouseMove={(e) => {
            handleMouseMove(e);
            handleResizeMouseMove(e);
          }}
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
                  Study Time
                </span>
                <button 
                  className="preferences-delete-block"
                  onClick={() => deleteBlock(block.id)}
                  title="Delete"
                >
                  ×
                </button>
              </div>
              {/* Resize handles */}
              <div 
                className="preferences-resize-handle start"
                onMouseDown={(e) => handleResizeMouseDown(e, block.id, 'start')}
                title="Resize start time"
              />
              <div 
                className="preferences-resize-handle end"
                onMouseDown={(e) => handleResizeMouseDown(e, block.id, 'end')}
                title="Resize end time"
              />
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

          {/* Bedtime blocks */}
          {Object.entries(bedtimes).map(([day, bedtime]) => {
            if (!bedtime) return null;
            return (
              <div
                key={bedtime.id}
                className={`preferences-time-block ${bedtime.type}`}
                style={{
                  left: dayToPosition(parseInt(day)), // No additional offset needed - grid already accounts for time column
                  top: timeToPosition(bedtime.startTime), // No additional offset - grid cells have margin-top
                  height: timeToPosition(bedtime.endTime - bedtime.startTime),
                  width: getGridDimensions().dayWidth
                }}
              >
                <div className="preferences-block-content">
                  <span className="preferences-block-time">
                    Bedtime
                  </span>
                  <button 
                    className="preferences-delete-block"
                    onClick={() => deleteBedtime(parseInt(day))}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}

          {/* Study time creation preview */}
          {isCreating && createStart && selectedButton === 'study' && (
            <div
              className="preferences-time-block study preview"
              style={{
                left: dayToPosition(createStart.day),
                top: timeToPosition(createStart.time * 30),
                height: hoverEnd && hoverEnd.day === createStart.day && hoverEnd.time > createStart.time
                  ? timeToPosition(hoverEnd.time * 30) - timeToPosition(createStart.time * 30)
                  : 6.67, // Default height if no hover end
                width: getGridDimensions().dayWidth
              }}
            >
              <div className="preferences-block-content">
                <span className="preferences-block-time">
                  {hoverEnd && hoverEnd.day === createStart.day && hoverEnd.time > createStart.time
                    ? `${formatTime(createStart.time * 30)} - ${formatTime(hoverEnd.time * 30)}`
                    : `Start: ${formatTime(createStart.time * 30)}`
                  }
                </span>
              </div>
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  );
}