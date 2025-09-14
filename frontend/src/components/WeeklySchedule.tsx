import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { TimeBlock } from '@shared/types/activities';
import axios from 'axios';
import '../styles/WeeklySchedule.css';

interface WeeklyScheduleProps {
  onEditEvent?: (timeBlock: TimeBlock) => void;
  onDeleteEvent?: (timeBlockId: string) => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function WeeklySchedule({ onEditEvent, onDeleteEvent }: WeeklyScheduleProps) {
  const { currentUser } = useAuth();
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetchSchedule();
    }
  }, [currentUser]);

  const fetchSchedule = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/schedule/${currentUser.uid}`);

      if (response.data.success) {
        setTimeBlocks(response.data.timeBlocks || []);
      } else {
        console.warn('No schedule found for user');
        setTimeBlocks([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch schedule:', err);
      
      // Handle 404 as a normal case (no schedule exists yet)
      if (err.response?.status === 404) {
        console.log('No schedule found for user - this is normal for new users');
        setTimeBlocks([]);
        setError(null);
      } else {
        setError('Failed to load schedule');
        setTimeBlocks([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (timeBlockId: string) => {
    if (!currentUser || !confirm('Are you sure you want to delete this event?')) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/schedule/${currentUser.uid}/timeblocks/${timeBlockId}`);
      setTimeBlocks(prev => prev.filter(tb => tb.id !== timeBlockId));

      if (onDeleteEvent) {
        onDeleteEvent(timeBlockId);
      }
    } catch (err) {
      console.error('Failed to delete event:', err);
      alert('Failed to delete event. Please try again.');
    }
  };

  const getEventStyle = (timeBlock: TimeBlock) => {
    const startHour = Math.floor(timeBlock.startTime / 60);
    const startMinute = timeBlock.startTime % 60;
    const endHour = Math.floor(timeBlock.endTime / 60);
    const endMinute = timeBlock.endTime % 60;

    const top = (startHour * 60 + startMinute) / 60 * 3; // 3rem per hour
    const height = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 60 * 3;

    return {
      top: `${top}rem`,
      height: `${height}rem`,
      backgroundColor: getTypeColor(timeBlock.type),
    };
  };

  const getTypeColor = (type: TimeBlock['type']) => {
    switch (type) {
      case 'study': return 'var(--accent-color, #4ecdc4)';
      case 'wake': return '#ffa726';
      case 'bedtime': return '#7e57c2';
      default: return '#90a4ae';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  if (loading) {
    return (
      <div className="weekly-schedule loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weekly-schedule error">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={fetchSchedule} className="retry-button">
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="weekly-schedule">
      <div className="schedule-header">
        <h3>📅 Weekly Schedule</h3>
        <p className="schedule-summary">
          {timeBlocks.length > 0
            ? `${timeBlocks.length} scheduled events`
            : 'No events scheduled'
          }
        </p>
      </div>

      <div className="schedule-grid">
        <div className="time-column">
          <div className="time-header">Time</div>
          {HOURS.map(hour => (
            <div key={hour} className="time-slot">
              <span className="time-label">
                {hour === 0 ? '12 AM' :
                 hour < 12 ? `${hour} AM` :
                 hour === 12 ? '12 PM' :
                 `${hour - 12} PM`}
              </span>
            </div>
          ))}
        </div>

        {DAYS.map((day, dayIndex) => {
          const dayEvents = timeBlocks.filter(tb => tb.day === dayIndex);

          return (
            <div key={day} className="day-column">
              <div className="day-header">
                <span className="day-name">{day}</span>
                <span className="day-count">{dayEvents.length} events</span>
              </div>

              <div className="day-timeline">
                {HOURS.map(hour => (
                  <div key={hour} className="hour-slot"></div>
                ))}

                {dayEvents.map(timeBlock => (
                  <div
                    key={timeBlock.id}
                    className="schedule-event"
                    style={getEventStyle(timeBlock)}
                    title={timeBlock.notes || timeBlock.type}
                  >
                    <div className="event-content">
                      <div className="event-title">
                        {timeBlock.notes || `${timeBlock.type.charAt(0).toUpperCase() + timeBlock.type.slice(1)} Time`}
                      </div>
                      <div className="event-time">
                        {formatTime(timeBlock.startTime)} - {formatTime(timeBlock.endTime)}
                      </div>

                      <div className="event-actions">
                        {onEditEvent && (
                          <button
                            className="event-action edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditEvent(timeBlock);
                            }}
                            title="Edit event"
                          >
                            ✏️
                          </button>
                        )}
                        <button
                          className="event-action delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(timeBlock.id);
                          }}
                          title="Delete event"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {timeBlocks.length === 0 && (
        <div className="empty-schedule">
          <div className="empty-icon">📅</div>
          <h4>No Schedule Events</h4>
          <p>Import a calendar or add events in your preferences to see your weekly schedule here.</p>
        </div>
      )}
    </div>
  );
}