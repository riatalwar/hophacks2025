import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import '../styles/ClassInput.css';

interface Class {
  id: string;
  name: string;
  professor: string;
  credits: number;
  color: string;
}

export function ClassInput() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [newClass, setNewClass] = useState({
    name: '',
    professor: '',
    credits: 3,
    color: '#ffffff'
  });

  const colors = [
    '#ffffff', '#ff6b6b', '#4ecdc4', '#45b7d1', 
    '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'
  ];

  const addClass = () => {
    if (newClass.name.trim()) {
      const classToAdd: Class = {
        id: Date.now().toString(),
        ...newClass
      };
      setClasses([...classes, classToAdd]);
      setNewClass({
        name: '',
        professor: '',
        credits: 3,
        color: '#ffffff'
      });
    }
  };

  const removeClass = (id: string) => {
    setClasses(classes.filter(cls => cls.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addClass();
    }
  };

  return (
    <div className="class-input-page">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="class-input-container">
        <div className="class-input-header">
          <h1>Add Your Classes</h1>
          <p>Enter all the classes you're taking this semester to get started with Class Catcher</p>
        </div>

        {/* Add Class Form */}
        <div className="add-class-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="className">Class Name</label>
              <input
                id="className"
                type="text"
                placeholder="e.g., Introduction to Computer Science"
                value={newClass.name}
                onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="form-group">
              <label htmlFor="professor">Professor</label>
              <input
                id="professor"
                type="text"
                placeholder="e.g., Dr. Smith"
                value={newClass.professor}
                onChange={(e) => setNewClass({...newClass, professor: e.target.value})}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="credits">Credits</label>
              <select
                id="credits"
                value={newClass.credits}
                onChange={(e) => setNewClass({...newClass, credits: parseInt(e.target.value)})}
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
                    className={`color-option ${newClass.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewClass({...newClass, color})}
                  />
                ))}
              </div>
            </div>
          </div>

          <button className="add-class-button" onClick={addClass}>
            + Add Class
          </button>
        </div>

        {/* Classes List */}
        <div className="classes-list">
          <h2>Your Classes ({classes.length})</h2>
          {classes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <p>No classes added yet. Add your first class above!</p>
            </div>
          ) : (
            <div className="classes-grid">
              {classes.map((cls) => (
                <div key={cls.id} className="class-card" style={{ borderLeftColor: cls.color }}>
                  <div className="class-info">
                    <h3>{cls.name}</h3>
                    <p className="professor">{cls.professor}</p>
                    <span className="credits">{cls.credits} credit{cls.credits !== 1 ? 's' : ''}</span>
                  </div>
                  <button 
                    className="remove-class"
                    onClick={() => removeClass(cls.id)}
                    title="Remove class"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {classes.length > 0 && (
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
