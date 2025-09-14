import { useState, useRef, useEffect } from 'react';
import type { TimeBlock, Schedule } from '@shared/types/activities';
import '../styles/PreferencesWeekCalendar.css';

interface DashboardWeeklyScheduleProps {
  schedule?: Schedule | null;
}

export function DashboardWeeklySchedule({ schedule }: DashboardWeeklyScheduleProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [wakeUpTimes, setWakeUpTimes] = useState<{ [day: number]: TimeBlock | null }>({});
  const [bedtimes, setBedtimes] = useState<{ [day: number]: TimeBlock | null }>({});
  const calendarRef = useRef<HTMLDivElement>(null);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = Array.from({ length: 48 }, (_, i) => i); // 48 slots for 30-minute intervals

  // Constants
  const HALF_HOUR_HEIGHT = 20; // Half of hour height for 30-minute intervals
  const DAYS_COUNT = 7;

  // Helper functions
  const timeToPosition = (time: number) => (time / 30) * HALF_HOUR_HEIGHT; // 30-minute intervals
  
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

  // Process schedule data when it changes
  useEffect(() => {
    if (schedule && schedule.timeBlocks) {
      const allTimeBlocks: TimeBlock[] = Object.values(schedule.timeBlocks);
      const wakeUpTimesMap: { [day: number]: TimeBlock | null } = {};
      const bedtimesMap: { [day: number]: TimeBlock | null } = {};
      const studyTimeBlocks: TimeBlock[] = [];

      // Process each time block
      allTimeBlocks.forEach(block => {
        if (block.type === 'wake') {
          wakeUpTimesMap[block.day] = block;
        } else if (block.type === 'bedtime') {
          bedtimesMap[block.day] = block;
        } else if (block.type === 'study') {
          studyTimeBlocks.push(block);
        }
      });

      setTimeBlocks(studyTimeBlocks);
      setWakeUpTimes(wakeUpTimesMap);
      setBedtimes(bedtimesMap);
    } else {
      // Clear data if no schedule
      setTimeBlocks([]);
      setWakeUpTimes({});
      setBedtimes({});
    }
  }, [schedule]);

  // Toggle minimize/maximize
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const getGridDimensions = () => {
    if (!calendarRef.current) return { dayWidth: 0, gridWidth: 0 };
    const gridWidth = calendarRef.current.offsetWidth - 60;
    return { dayWidth: gridWidth / DAYS_COUNT, gridWidth };
  };

  // Helper function removed - not needed for display-only component

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

            {/* Time blocks */}
            {timeBlocks.map(block => (
              <div
                key={block.id}
                className={`preferences-time-block ${block.type}`}
                style={{
                  left: dayToPosition(block.day),
                  top: timeToPosition(block.startTime),
                  height: timeToPosition(block.endTime - block.startTime),
                  width: getGridDimensions().dayWidth
                }}
              >
                <div className="preferences-block-content">
                  <span className="preferences-block-time">
                    {formatTimeWithDay(block.startTime)} - {formatTimeWithDay(block.endTime)}
                  </span>
                  {block.notes && (
                    <span className="preferences-block-summary">
                      {block.notes}
                    </span>
                  )}
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
                    left: dayToPosition(parseInt(day)),
                    top: timeToPosition(wakeTime.startTime),
                    height: timeToPosition(wakeTime.endTime - wakeTime.startTime),
                    width: getGridDimensions().dayWidth
                  }}
                >
                  <div className="preferences-block-content">
                    <span className="preferences-block-time">
                      {formatTimeWithDay(wakeTime.startTime)}
                    </span>
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
                    left: dayToPosition(parseInt(day)),
                    top: timeToPosition(bedtime.startTime),
                    height: timeToPosition(bedtime.endTime - bedtime.startTime),
                    width: getGridDimensions().dayWidth
                  }}
                >
                  <div className="preferences-block-content">
                    <span className="preferences-block-time">
                      {formatTimeWithDay(bedtime.startTime, true)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Empty state message when no blocks */}
            {timeBlocks.length === 0 && Object.values(wakeUpTimes).every(v => !v) && Object.values(bedtimes).every(v => !v) && (
              <div className="preferences-empty-state">
                <div className="preferences-empty-message">
                  <h4>No Schedule Set</h4>
                  <p>Go to Settings to set up your weekly schedule with wake up times, bedtimes, and busy times.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
