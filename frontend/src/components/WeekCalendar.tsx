import { useState, useRef, useEffect } from 'react';
import type { TimeBlock } from '../types/ClassTypes';
import '../styles/PreferencesWeekCalendar.css';

interface WeekCalendarProps {
  onScheduleChange: (schedule: TimeBlock[]) => void;
  onWakeUpTimesChange?: (wakeUpTimes: { [day: number]: TimeBlock | null }) => void;
  onBedtimesChange?: (bedtimes: { [day: number]: TimeBlock | null }) => void;
  onStudyTimesChange?: (studyTimes: TimeBlock[]) => void;
  externalTimeBlocks?: TimeBlock[]; // New prop to receive external time blocks
}

export function WeekCalendar({ onScheduleChange, onWakeUpTimesChange, onBedtimesChange, onStudyTimesChange, externalTimeBlocks }: WeekCalendarProps) {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [wakeUpTimes, setWakeUpTimes] = useState<{ [day: number]: TimeBlock | null }>({});
  const [bedtimes, setBedtimes] = useState<{ [day: number]: TimeBlock | null }>({});
  const [errorMessage, setErrorMessage] = useState<string>('');
  // const [dragging, setDragging] = useState<string | null>(null);
  // const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  // const [resizing, setResizing] = useState<{ blockId: string; handle: 'start' | 'end' } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createStart, setCreateStart] = useState<{ day: number; time: number } | null>(null);
  const [hoverEnd, setHoverEnd] = useState<{ day: number; time: number } | null>(null);
  const [selectedButton, setSelectedButton] = useState<'wake' | 'bedtime' | 'study' | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Helper functions for localStorage persistence
  const saveTimeBlocks = (blocks: TimeBlock[]) => {
    localStorage.setItem('studySchedule_timeBlocks', JSON.stringify(blocks));
  };

  // const saveWakeUpTimes = (wakeTimes: { [day: number]: TimeBlock | null }) => {
  //   localStorage.setItem('studySchedule_wakeUpTimes', JSON.stringify(wakeTimes));
  // };

  // const saveBedtimes = (bedTimes: { [day: number]: TimeBlock | null }) => {
  //   localStorage.setItem('studySchedule_bedtimes', JSON.stringify(bedTimes));
  // };

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTimeBlocks = localStorage.getItem('studySchedule_timeBlocks');
    if (savedTimeBlocks) {
      try {
        setTimeBlocks(JSON.parse(savedTimeBlocks));
      } catch (error) {
        console.error('Error loading time blocks:', error);
      }
    }

    const savedWakeUpTimes = localStorage.getItem('studySchedule_wakeUpTimes');
    if (savedWakeUpTimes) {
      try {
      setWakeUpTimes(JSON.parse(savedWakeUpTimes));
      } catch (error) {
        console.error('Error loading wake up times:', error);
      }
    }
    
    const savedBedtimes = localStorage.getItem('studySchedule_bedtimes');
    if (savedBedtimes) {
      try {
      setBedtimes(JSON.parse(savedBedtimes));
      } catch (error) {
        console.error('Error loading bedtimes:', error);
      }
    }
  }, []);

  // Notify parent component when schedule changes
  useEffect(() => {
    onScheduleChange(timeBlocks);
  }, [timeBlocks, onScheduleChange]);

  // Notify parent component when wake up times change
  useEffect(() => {
    if (onWakeUpTimesChange) {
      onWakeUpTimesChange(wakeUpTimes);
    }
  }, [wakeUpTimes, onWakeUpTimesChange]);

  // Notify parent component when bedtimes change
  useEffect(() => {
    if (onBedtimesChange) {
      onBedtimesChange(bedtimes);
    }
  }, [bedtimes, onBedtimesChange]);

  // Handle external time blocks (e.g., from ICS import)
  useEffect(() => {
    if (externalTimeBlocks && externalTimeBlocks.length > 0) {
      console.log('WeekCalendar: Received external time blocks:', externalTimeBlocks);
      
      // Merge external time blocks with existing ones
      setTimeBlocks(prevBlocks => {
        // Remove any previously imported blocks (those with 'imported-' prefix)
        const filteredBlocks = prevBlocks.filter(block => !block.id.startsWith('imported-'));
        
        // Add new external blocks
        const mergedBlocks = [...filteredBlocks, ...externalTimeBlocks];
        
        console.log('WeekCalendar: Merged time blocks:', mergedBlocks);
        
        // Save to localStorage
        saveTimeBlocks(mergedBlocks);
        
        return mergedBlocks;
      });
    }
  }, [externalTimeBlocks]);

  // Notify parent component when study times change
  useEffect(() => {
    if (onStudyTimesChange) {
      const studyTimes = timeBlocks.filter(block => block.type === 'study');
      onStudyTimesChange(studyTimes);
    }
  }, [timeBlocks, onStudyTimesChange]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = Array.from({ length: 48 }, (_, i) => i); // 48 slots for 30-minute intervals

  // Function to get the week starting with Monday, September 15th
  const getWeekStartingSeptember15 = () => {
    // Monday, September 15th, 2025
    const mondaySept15 = new Date(2025, 8, 15); // Month is 0-indexed, so 8 = September
    
    // Generate the week (Monday to Sunday) starting with September 15th
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(mondaySept15);
      date.setDate(mondaySept15.getDate() + i);
      week.push(date);
    }
    
    return week;
  };

  // Initialize current week on component mount
  useEffect(() => {
    const week = getWeekStartingSeptember15();
    setCurrentWeek(week);
  }, []);

  // Constants
  const HALF_HOUR_HEIGHT = 20; // Half of hour height for 30-minute intervals
  // const DAYS_COUNT = 7;

  // Helper function to format time
  const formatTime = (timeSlot: number) => {
    const hours = Math.floor(timeSlot / 2);
    const minutes = (timeSlot % 2) * 30;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Helper function to format date
  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  // Helper function to get month name
  const getMonthName = (date: Date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[date.getMonth()];
  };

  // Helper function to get time block at position
  const getTimeBlockAt = (day: number, timeSlot: number) => {
    return timeBlocks.find(block => 
      block.day === day && 
      timeSlot >= block.startTime && 
      timeSlot < block.endTime
    );
  };

  // Helper function to validate study time
  const validateStudyTime = (day: number, startTime: number, endTime: number) => {
    if (startTime >= endTime) {
      return "End time must be after start time";
    }
    
    if (startTime < 0 || endTime > 47) {
      return "Time must be between 00:00 and 23:30";
    }
    
    // Check for conflicts with existing blocks
    const conflicts = timeBlocks.filter(block => 
      block.day === day && 
      !(endTime <= block.startTime || startTime >= block.endTime)
    );
    
    if (conflicts.length > 0) {
      return "Time conflicts with existing busy time blocks";
    }
    
    // Check wake up time
    const wakeUpTime = wakeUpTimes[day];
    if (wakeUpTime && startTime < wakeUpTime.startTime) {
      return `Please set a wake up time for ${days[day]} before creating busy time blocks`;
    }
    
    return null;
  };

  // Handle time slot click
  const handleTimeSlotClick = (day: number, timeSlot: number) => {
    if (selectedButton === 'study') {
      if (!isCreating) {
        setIsCreating(true);
        setCreateStart({ day, time: timeSlot });
        setHoverEnd({ day, time: timeSlot });
      } else if (createStart && createStart.day === day) {
        const startTime = Math.min(createStart.time, timeSlot);
        const endTime = Math.max(createStart.time, timeSlot) + 1;
        
        const validation = validateStudyTime(day, startTime, endTime);
        if (validation) {
          setErrorMessage(validation);
          setTimeout(() => setErrorMessage(''), 3000);
        } else {
          const newBlock: TimeBlock = {
            id: `study-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          day,
          startTime,
          endTime,
          type: 'study'
        };
        
          setTimeBlocks(prev => {
            const updated = [...prev, newBlock];
            saveTimeBlocks(updated);
            return updated;
          });
        }
        
        setIsCreating(false);
        setCreateStart(null);
        setHoverEnd(null);
      }
    }
  };

  // Handle mouse move for creating blocks
  const handleMouseMove = (day: number, timeSlot: number) => {
    if (isCreating && createStart && createStart.day === day) {
      setHoverEnd({ day, time: timeSlot });
    }
  };

  // Handle button click
  const handleButtonClick = (type: 'wake' | 'bedtime' | 'study') => {
    setSelectedButton(selectedButton === type ? null : type);
    setErrorMessage('');
  };

  // Handle minimize toggle
  const handleMinimizeToggle = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="preferences-week-calendar" ref={calendarRef}>
      <div className="preferences-calendar-header">
        <h3>Weekly Schedule</h3>
        <p>Click on the buttons below to set your wake up times, bedtimes, and busy times</p>
        
        {currentWeek.length > 0 && (
          <div className="preferences-week-info">
            <span className="preferences-week-dates">
              {getMonthName(currentWeek[0])} {currentWeek[0].getDate()} - {currentWeek[6].getDate()}, {currentWeek[0].getFullYear()}
            </span>
          </div>
        )}
        
        <div className="preferences-calendar-controls">
          <button 
            className={`preferences-control-button ${selectedButton === 'wake' ? 'active' : ''}`}
            onClick={() => handleButtonClick('wake')}
          >
            Wake Up Times
          </button>
            <button 
            className={`preferences-control-button ${selectedButton === 'bedtime' ? 'active' : ''}`}
            onClick={() => handleButtonClick('bedtime')}
            >
              Bedtimes
            </button>
            <button 
            className={`preferences-control-button ${selectedButton === 'study' ? 'active' : ''}`}
            onClick={() => handleButtonClick('study')}
          >
            Busy Times
          </button>
          <button
            className="preferences-minimize-button"
            onClick={handleMinimizeToggle}
          >
            {isMinimized ? '▼' : '▲'}
            </button>
          </div>

          {errorMessage && (
            <div className="preferences-error-message">
              {errorMessage}
            </div>
          )}
      </div>
      
      {!isMinimized && (
        <div className="preferences-calendar-grid">
          <div className="preferences-time-column">
            {timeSlots.map(timeSlot => (
              <div key={timeSlot} className="preferences-time-slot">
                {timeSlot % 2 === 0 && (
                  <span className="preferences-time-label">
                    {formatTime(timeSlot)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {days.map((day, dayIndex) => (
            <div key={day} className="preferences-day-column">
              <div className="preferences-day-header">
                <div className="preferences-day-name">{day}</div>
                {currentWeek.length > 0 && (
                  <div className="preferences-day-date">{formatDate(currentWeek[dayIndex])}</div>
                )}
          </div>

              <div className="preferences-day-slots">
                {timeSlots.map(timeSlot => {
                  const block = getTimeBlockAt(dayIndex, timeSlot);
                  const isCreatingBlock = isCreating && 
                    createStart && 
                    createStart.day === dayIndex && 
                    hoverEnd && 
                    timeSlot >= Math.min(createStart.time, hoverEnd.time) && 
                    timeSlot <= Math.max(createStart.time, hoverEnd.time);
                  
            return (
              <div
                      key={timeSlot}
                      className={`preferences-time-slot ${
                        block ? `preferences-${block.type}-block` : ''
                      } ${isCreatingBlock ? 'preferences-creating-block' : ''}`}
                      onClick={() => handleTimeSlotClick(dayIndex, timeSlot)}
                      onMouseMove={() => handleMouseMove(dayIndex, timeSlot)}
                style={{
                        height: `${HALF_HOUR_HEIGHT}px`,
                        backgroundColor: block ? 
                          (block.type === 'study' ? '#4ecdc4' : 
                           block.type === 'wake' ? '#ff6b6b' : '#96ceb4') : 
                          'transparent'
                      }}
                    >
                      {block && (
                <div className="preferences-block-content">
                          {block.type === 'study' && 'Study'}
                          {block.type === 'wake' && 'Wake'}
                          {block.type === 'bedtime' && 'Sleep'}
                </div>
                      )}
              </div>
            );
          })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
