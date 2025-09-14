import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import '../styles/ClassInput.css';
import type { Activity } from '../types/ClassTypes';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export function ActivityInput() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newActivity, setNewActivity] = useState({
    name: '',
    color: 'var(--accent-color)',
    pdfFile: null as File | null,
    websiteLink: '',
    canvasContent: ''
  });

  const colors = [
    '#4ecdc4', '#ff6b6b', '#45b7d1', '#96ceb4', 
    '#feca57', '#ff9ff3', '#54a0ff', '#a55eea'
  ];

  // Fetch activities from Firestore
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const activitiesCollection = collection(db, 'activities');
      const snapshot = await getDocs(activitiesCollection);
      const activitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        activityName: doc.data().activityName,
        color: doc.data().color,
        websiteLink: doc.data().websiteLink,
        canvasContent: doc.data().canvasContent,
        pdfFile: null // We'll handle file uploads separately
      }));
      setActivities(activitiesData);
      console.log('Fetched activities:', activitiesData);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load activities on component mount
  useEffect(() => {
    fetchActivities();
  }, []);

  const addActivity = async () => {
    if (newActivity.name.trim()) {
      try {
        const activityData = {
          activityName: newActivity.name,
          color: newActivity.color,
          websiteLink: newActivity.websiteLink,
          canvasContent: newActivity.canvasContent,
          userId: 'test-user-1', // For now, using a test user
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const docRef = await addDoc(collection(db, 'activities'), activityData);
        console.log('Activity added with ID:', docRef.id);
        
        // Refresh the activities list
        await fetchActivities();
        
        setNewActivity({
          name: '',
          color: 'var(--accent-color)',
          pdfFile: null,
          websiteLink: '',
          canvasContent: ''
        });
        setIsAddingNew(false);
      } catch (error) {
        console.error('Error adding activity:', error);
      }
    }
  };

  const removeActivity = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'activities', id));
      console.log('Activity deleted:', id);
      // Refresh the activities list
      await fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
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
                  <h3>{activity.activityName}</h3>
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

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner">⏳</div>
              <h3>Loading activities...</h3>
              <p>Fetching your activities from the database</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && activities.length === 0 && !isAddingNew && (
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
