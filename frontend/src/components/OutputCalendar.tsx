import React, { useState } from 'react';
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

  return (
    <div className="output-calendar">
      <h2>Output Calendar</h2>
    </div>
  );
};

export default OutputCalendar;