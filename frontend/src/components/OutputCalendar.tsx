import React, { useState, useEffect } from 'react';
import '../styles/OutputCalendar.css';

export interface OutputCalendarProps {
  userId: string;
  viewMode: string;
  onViewModeChange: (mode: string) => void;
}

// Days and time slots for grid rendering
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const START_HOUR = 8; // 8 AM (start of calendar grid)
const END_HOUR = 22; // 10 PM (end of calendar grid)
const TIME_INTERVAL = 60; // minutes per slot (use 60 for hourly, 30 for half-hourly)

type ScheduledStudySession = {
  id: string;
  day: number; // 0 = Monday, ...
  startTime: number; // minutes from midnight
  endTime: number; // minutes from midnight
  title: string;
  notes?: string;
};

const OutputCalendar: React.FC<OutputCalendarProps> = ({
  userId,
  viewMode,
  onViewModeChange,
}) => {
  const [schedule, setSchedule] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchSchedule = async () => {
      setIsLoading(true);
      setError(null);
      setSchedule(null);

      try {
        // Generate schedule (POST)
        const generateResp = await fetch(`/api/schedule/${userId}/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!generateResp.ok) {
          throw new Error('Failed to generate schedule.');
        }

        // Fetch generated schedule (GET)
        const scheduleResp = await fetch(`/api/schedule/${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!scheduleResp.ok) {
          throw new Error('Failed to retrieve schedule.');
        }

        const data = await scheduleResp.json();
        setSchedule(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [userId]);

  // Helper: map sessions for current week
  const renderWeeklyGrid = () => {
    // Build timeslots (array of intervals)
    const timeSlots = [];
    for (let mins = START_HOUR * 60; mins < END_HOUR * 60; mins += TIME_INTERVAL) {
      const hour = Math.floor(mins / 60);
      const minutes = mins % 60;
      const label =
        `${hour % 12 === 0 ? 12 : hour % 12}:${minutes.toString().padStart(2, '0')}${hour < 12 ? 'AM' : 'PM'}`;
      timeSlots.push({
        start: mins,
        end: mins + TIME_INTERVAL,
        label,
      });
    }

    // 1. Header row for days
    // 2. Grid rows for time slots.
    // 3. For each slot/day, find session(s) whose startTime falls into that slot/day.

    return (
      <div className="calendar-grid">
        <div className="calendar-grid-header">
          <div className="calendar-slot-cell time-label header"></div>
          {DAYS.map((d) => (
            <div className="calendar-slot-cell day-header" key={d}>{d}</div>
          ))}
        </div>
        {timeSlots.map((slot, rowIdx) => (
          <div className="calendar-grid-row" key={`row-${rowIdx}`}>
            <div className="calendar-slot-cell time-label">{slot.label}</div>
            {DAYS.map((_, colIdx) => {
              const cellSessions = (schedule.sessions ?? []).filter(
                (session: ScheduledStudySession) =>
                  session.day === colIdx &&
                  session.startTime >= slot.start &&
                  session.startTime < slot.end
              );
              return (
                <div className="calendar-slot-cell calendar-day-slot" key={`slot-${rowIdx}-${colIdx}`}>
                  {cellSessions.map((session: ScheduledStudySession) => (
                    <div className="session-block" key={session.id}>
                      <div className="session-title">{session.title}</div>
                      {session.notes && <div className="session-notes">{session.notes}</div>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="output-calendar">
      <h2>Output Calendar</h2>
      {isLoading && <div>Generating schedule...</div>}
      {error && <div className="error-message">{error}</div>}
      {!isLoading && !error && !schedule && (
        <div>No schedule generated.</div>
      )}
      {!isLoading && !error && schedule && schedule.sessions && renderWeeklyGrid()}
    </div>
  );
};

export default OutputCalendar;