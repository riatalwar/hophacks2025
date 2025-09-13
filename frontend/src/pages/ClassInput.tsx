import React, { useState } from 'react';
import { Navigation } from '../components/Navigation';
import '../styles/ClassInput.css';
import type { Activity } from '../types/ClassTypes';

export function ClassInput() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newActivity, setNewActivity] = useState({
    name: '',
    credits: 3,
    color: '#ffffff'
  });

  const colors = [
    '#ffffff', '#ff6b6b', '#4ecdc4', '#45b7d1', 
    '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'
  ];

  const addActivity = () => {
    if (newActivity.name.trim()) {
      const activityToAdd: Activity = {
        id: Date.now().toString(),
        ...newActivity
      };
      setActivities([...activities, activityToAdd]);
      setNewActivity({
        name: '',
        credits: 3,
        color: '#ffffff'
      });
    }
  };

  const removeActivity = (id: string) => {
    setActivities(activities.filter(activity => activity.id !== id));
  };
v e
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addActivity();
    }
  };

  return (
    <div className="class-input-page">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="class-input-container">
        <div className="class-input-header">
          <h1>Add Your Activities</h1>
          <p>Enter all the activities you're involved in this semester to get started with Class Catcher</p>
        </div>

        {/* Add Activity Form */}
        <div className="add-class-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="activityName">Activity Name</label>
              <input
                id="activityName"
                type="text"
                placeholder="e.g., Introduction to Computer Science"
                value={newActivity.name}
                onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="credits">Credits</label>
              <select
                id="credits"
                value={newActivity.credits}
                onChange={(e) => setNewActivity({...newActivity, credits: parseInt(e.target.value)})}
              >
                <option value={1}>1 Credit</option>
                <option value={2}>2 Credits</option>
                <option value={3}>3 Credits</option>
                <option value={4}>4 Credits</option>
                <option value={5}>5 Credits</option>
              </select>
            </div>
            <div className="form-group">
              <label>Color</label>
              <div className="color-picker">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`color-option ${newActivity.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewActivity({...newActivity, color})}
                  />
                ))}
              </div>
            </div>
          </div>

          <button className="add-class-button" onClick={addActivity}>
            + Add Activity
          </button>
        </div>

        {/* Activities List */}
        <div className="classes-list">
          <h2>Your Activities ({activities.length})</h2>
          {activities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <p>No activities added yet. Add your first activity above!</p>
            </div>
          ) : (
            <div className="classes-grid">
              {activities.map((activity) => (
                <div key={activity.id} className="class-card" style={{ borderLeftColor: activity.color }}>
                  <div className="class-info">
                    <h3>{activity.name}</h3>
                    <span className="credits">{activity.credits} credit{activity.credits !== 1 ? 's' : ''}</span>
                  </div>
                  <button 
                    className="remove-class"
                    onClick={() => removeActivity(activity.id)}
                    title="Remove activity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {activities.length > 0 && (
          <div className="action-buttons">
            <button className="secondary-button">
              Save & Continue
            </button>
            <button className="primary-button">
              Next: Add Course Links
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
