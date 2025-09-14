import { useState, useRef, useEffect } from 'react';
import type { TimeBlock } from '@shared/types/activities';
import '../styles/PreferencesWeekCalendar.css';

interface DashboardWeeklyScheduleProps {
  // Props removed - dashboard will always show empty state
}

export function DashboardWeeklySchedule({}: DashboardWeeklyScheduleProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
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

  // Helper function to format time with day indication for cross-midnight times
  const formatTimeWithDay = (minutes: number, isBedtime = false) => {
    const timeStr = formatTime(minutes);
    
    // If it's a bedtime and it's early morning (before 6 AM), indicate it's the next day
    if (isBedtime && minutes <= 360) {
      return `${timeStr} (next day)`;
    }
    
    return timeStr;
  };

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

  // Toggle minimize/maximize
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const getGridDimensions = () => {
    if (!calendarRef.current) return { dayWidth: 0, gridWidth: 0 };
    const gridWidth = calendarRef.current.offsetWidth - 60;
    return { dayWidth: gridWidth / DAYS_COUNT, gridWidth };
  };

  // Helper function to get time block at position
  const getTimeBlockAt = (day: number, timeSlot: number) => {
    return timeBlocks.find(block => 
      block.day === day && 
      timeSlot >= block.startTime && 
      timeSlot < block.endTime
    );
  };

  return (
    <div className={`preferences-week-calendar-container ${isMinimized ? 'minimized' : ''}`}>
      <div className="preferences-calendar-header">
        <div className="preferences-header-content">
          <div className="preferences-header-text">
            <h3>Weekly Schedule</h3>
            <p>View your scheduled activities and study times for the week</p>
            
            {currentWeek.length > 0 && (
              <div className="preferences-week-info">
                <span className="preferences-week-dates">
                  {currentWeek[0].toLocaleDateString('en-US', { month: 'long' })} {currentWeek[0].getDate()} - {currentWeek[6].getDate()}, {currentWeek[0].getFullYear()}
                </span>
              </div>
            )}
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
      
      {!isMinimized && (
        <div 
          className="preferences-week-calendar"
          ref={calendarRef}
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
              {days.map((day, index) => (
                <div key={day} className="preferences-day-header">
                  <div className="preferences-day-name">{day}</div>
                  {currentWeek.length > 0 && (
                    <div className="preferences-day-date">
                      {currentWeek[index].getMonth() + 1}/{currentWeek[index].getDate()}
                    </div>
                  )}
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
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Empty state - no message displayed */}
          </div>
        </div>
      )}
    </div>
  );
}
