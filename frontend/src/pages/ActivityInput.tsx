import React, { useState } from 'react';
import { Navigation } from '../components/Navigation';
import '../styles/ClassInput.css';
import type { Activity } from '../types/ClassTypes';

export function ClassInput() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newActivity, setNewActivity] = useState({
    name: '',
    color: '#4ecdc4',
    pdfFile: null as File | null,
    websiteLink: '',
    canvasContent: ''
  });

  const colors = [
    '#4ecdc4', '#ff6b6b', '#45b7d1', '#96ceb4', 
    '#feca57', '#ff9ff3', '#54a0ff', '#a55eea'
  ];

  const addActivity = () => {
    if (newActivity.name.trim()) {
      const activityToAdd: Activity = {
        id: Date.now().toString(),
        name: newActivity.name,
        color: newActivity.color,
        pdfFile: newActivity.pdfFile,
        websiteLink: newActivity.websiteLink,
        canvasContent: newActivity.canvasContent
      };
      setActivities([...activities, activityToAdd]);
      setNewActivity({
        name: '',
        color: '#4ecdc4',
        pdfFile: null,
        websiteLink: '',
        canvasContent: ''
      });
      setIsAddingNew(false);
    }
  };

  const removeActivity = (id: string) => {
    setActivities(activities.filter(activity => activity.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      addActivity();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewActivity({...newActivity, pdfFile: file});
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

        {/* Activities List */}
        <div className="activities-list">
          <h2>Your Activities ({activities.length})</h2>
          
          {/* Existing Activities */}
          {activities.map((activity) => (
            <div key={activity.id} className="activity-item" style={{ borderLeftColor: activity.color }}>
              <div className="activity-content">
                <div className="activity-header">
                  <h3>{activity.name}</h3>
                  <button 
                    className="remove-activity"
                    onClick={() => removeActivity(activity.id)}
                    title="Remove activity"
                  >
                    ×
                  </button>
                </div>
                <div className="activity-attachments">
                  {activity.pdfFile && (
                    <span className="attachment-tag">📄 PDF uploaded</span>
                  )}
                  {activity.websiteLink && (
                    <span className="attachment-tag">🔗 Link added</span>
                  )}
                  {activity.canvasContent && (
                    <span className="attachment-tag">📝 Canvas content</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add New Activity Form */}
          {isAddingNew ? (
            <div className="add-activity-form">
              <div className="form-section">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Activity name (e.g., Computer Science 101)"
                    value={newActivity.name}
                    onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
                    onKeyPress={handleKeyPress}
                    autoFocus
                  />
                </div>
                
                <div className="form-group">
                  <label>Choose a color for this activity</label>
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

              <div className="form-section">
                <div className="form-group">
                  <label>Upload PDF Syllabus or Document</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  {newActivity.pdfFile && (
                    <span className="file-selected">✓ {newActivity.pdfFile.name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Course Website Link</label>
                  <input
                    type="url"
                    placeholder="Paste course website, Canvas, or other learning platform URL"
                    value={newActivity.websiteLink}
                    onChange={(e) => setNewActivity({...newActivity, websiteLink: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Canvas or Learning Profile Content</label>
                  <textarea
                    placeholder="Paste important information from Canvas, course announcements, or other learning platforms"
                    value={newActivity.canvasContent}
                    onChange={(e) => setNewActivity({...newActivity, canvasContent: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button className="cancel-button" onClick={() => setIsAddingNew(false)}>
                  Cancel
                </button>
                <button className="add-button" onClick={addActivity}>
                  Add Activity
                </button>
              </div>
            </div>
          ) : (
            <button className="add-activity-button" onClick={() => setIsAddingNew(true)}>
              <div className="add-button-content">
                <span className="plus-icon">+</span>
                <div className="add-button-text">
                  <span className="add-button-title">Add New Activity</span>
                  <span className="add-button-subtitle">Click to add a new course or activity</span>
                </div>
              </div>
            </button>
          )}

          {/* Empty State */}
          {activities.length === 0 && !isAddingNew && (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No activities added yet</h3>
              <p>Click the button above to add your first course or activity and get started with organizing your semester!</p>
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
