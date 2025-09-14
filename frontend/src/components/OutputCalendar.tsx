import React, { useState, useEffect } from 'react';
import '../styles/OutputCalendar.css';

export interface OutputCalendarProps {
  userId: string;
  viewMode: string;
  onViewModeChange: (mode: string) => void;
}

const OutputCalendar: React.FC<OutputCalendarProps> = ({
  userId,
  viewMode,
  onViewModeChange,
}) => {
  const [schedule, setSchedule] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentViewDate, setCurrentViewDate] = useState<Date>(new Date());
  const [calendarViewMode, setCalendarViewMode] = useState<string>(viewMode);

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

  return (
    <div className="output-calendar">
      <h2>Output Calendar</h2>
      {isLoading && <div>Generating schedule...</div>}
      {error && <div className="error-message">{error}</div>}
      {!isLoading && !error && !schedule && (
        <div>No schedule generated.</div>
      )}
      {/* When schedule exists, still show the header only (do not render grid yet) */}
    </div>
  );
};

export default OutputCalendar;