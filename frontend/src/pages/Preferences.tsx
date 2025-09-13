import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { WeekCalendar } from '../components/WeekCalendar';
import { reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useAuth } from '../hooks/useAuth';
import '../styles/Preferences.css';

export function Preferences() {
  const { currentUser } = useAuth();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [password, setPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [studySchedule, setStudySchedule] = useState<any[]>([]);
  const [emailNotifications, setEmailNotifications] = useState({
    studyReminders: true,
    assignmentDeadlines: true,
    weeklyDigest: false,
    courseUpdates: true,
    systemAlerts: true
  });
  const [shareDataAnonymously, setShareDataAnonymously] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [accentColor, setAccentColor] = useState('#4ecdc4');

  const accentColors = [
    '#4ecdc4', '#ff6b6b', '#45b7d1', '#96ceb4', 
    '#feca57', '#ff9ff3', '#54a0ff', '#a55eea'
  ];

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.email || !password.trim()) {
      setUnlockError('Please enter your password');
      return;
    }

    try {
      setIsUnlocking(true);
      setUnlockError('');
      
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);
      
      setIsUnlocked(true);
      setPassword('');
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        setUnlockError('Incorrect password');
      } else if (error.code === 'auth/too-many-requests') {
        setUnlockError('Too many failed attempts. Please try again later.');
      } else {
        setUnlockError('Failed to verify password. Please try again.');
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPassword('');
    setUnlockError('');
  };

  const handleScheduleChange = (schedule: any[]) => {
    setStudySchedule(schedule);
  };

  const handleNotificationToggle = (notificationType: keyof typeof emailNotifications) => {
    setEmailNotifications(prev => ({
      ...prev,
      [notificationType]: !prev[notificationType]
    }));
  };

  const handleDataSharingToggle = () => {
    setShareDataAnonymously(prev => !prev);
  };

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    // Apply theme immediately
    if (newTheme) {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.classList.add('light-theme');
    }
  };

  const handleAccentColorChange = (color: string) => {
    setAccentColor(color);
    
    // Apply accent color immediately
    document.documentElement.style.setProperty('--accent-color', color);
  };

  // Apply initial theme and accent color on component mount
  useEffect(() => {
    // Apply initial accent color
    document.documentElement.style.setProperty('--accent-color', accentColor);
    
    // Apply initial theme
    if (isDarkMode) {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.classList.add('light-theme');
    }
  }, []);

  const handleSaveAndContinue = () => {
    // Re-lock the settings (appearance changes are already applied)
    setIsUnlocked(false);
    setPassword('');
    setUnlockError('');
  };

  return (
    <div className="preferences-page">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="preferences-container">
        <div className="preferences-header">
          <h1>Preferences & Settings</h1>
          <p>Customize your Class Catcher experience to match your study preferences and academic needs.</p>
        </div>

        <div className="preferences-content">
          {/* Unlock Form */}
          {!isUnlocked ? (
            <div className="unlock-section">
              <div className="unlock-icon">🔒</div>
              <h2>Unlock Settings</h2>
              <p>Enter your password to edit preferences and settings</p>
              <form onSubmit={handleUnlock} className="unlock-form">
                <div className="form-group">
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="password-input"
                    disabled={isUnlocking}
                  />
                </div>
                {unlockError && (
                  <div className="error-message">{unlockError}</div>
                )}
                <button 
                  type="submit" 
                  className="unlock-button"
                  disabled={isUnlocking || !password.trim()}
                >
                  {isUnlocking ? 'Verifying...' : 'Unlock Settings'}
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="unlock-status">
                <div className="unlock-indicator">
                  <span className="unlock-icon">🔓</span>
                  <span>Settings Unlocked</span>
                </div>
                <button onClick={handleLock} className="lock-button">
                  Lock Settings
                </button>
              </div>
              
              <div className="preferences-grid">
                {/* Study Preferences Section */}
                <div className="preferences-section study-preferences">
                  <h2>Study Preferences</h2>
                  <div className="section-content">
                    <p>Customize your study schedule, learning style, and academic preferences to optimize your Class Catcher experience.</p>
                    <WeekCalendar onScheduleChange={handleScheduleChange} />
                  </div>
                </div>

                {/* Settings Section */}
                <div className="preferences-section">
                  <h2>Settings</h2>
                  <div className="section-content">
                    <p>Manage your account settings, notifications, and general application preferences.</p>
                    
                    <div className="settings-group">
                      <h3>Email Notifications</h3>
                      <p className="settings-description">Choose which email notifications you'd like to receive</p>
                      
                      <div className="notification-settings">
                        <div className="notification-item">
                          <div className="notification-info">
                            <h4>Study Reminders</h4>
                            <p>Get reminded about your scheduled study sessions</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={emailNotifications.studyReminders}
                              onChange={() => handleNotificationToggle('studyReminders')}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>

                        <div className="notification-item">
                          <div className="notification-info">
                            <h4>Assignment Deadlines</h4>
                            <p>Receive alerts about upcoming assignment due dates</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={emailNotifications.assignmentDeadlines}
                              onChange={() => handleNotificationToggle('assignmentDeadlines')}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>

                        <div className="notification-item">
                          <div className="notification-info">
                            <h4>Weekly Digest</h4>
                            <p>Get a weekly summary of your academic progress</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={emailNotifications.weeklyDigest}
                              onChange={() => handleNotificationToggle('weeklyDigest')}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>

                        <div className="notification-item">
                          <div className="notification-info">
                            <h4>Course Updates</h4>
                            <p>Notifications about changes to your courses and activities</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={emailNotifications.courseUpdates}
                              onChange={() => handleNotificationToggle('courseUpdates')}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>

                        <div className="notification-item">
                          <div className="notification-info">
                            <h4>System Alerts</h4>
                            <p>Important updates about Class Catcher features and maintenance</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={emailNotifications.systemAlerts}
                              onChange={() => handleNotificationToggle('systemAlerts')}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Privacy Section */}
                <div className="preferences-section">
                  <h2>Privacy</h2>
                  <div className="section-content">
                    <p>Control your data privacy, security settings, and how your information is shared and stored.</p>
                    
                    <div className="privacy-group">
                      <h3>Data Sharing & Privacy</h3>
                      
                      <div className="privacy-item">
                        <div className="privacy-info">
                          <h4>Share Data Anonymously</h4>
                          <p>Help improve Class Catcher for everyone by sharing anonymous usage data. This helps us understand how students study and optimize features for better academic success.</p>
                          <div className="privacy-benefits">
                            <span className="benefit-tag">🔒 Completely Anonymous</span>
                            <span className="benefit-tag">📊 Helps Improve Features</span>
                            <span className="benefit-tag">🎓 Better Study Tools</span>
                          </div>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={shareDataAnonymously}
                            onChange={handleDataSharingToggle}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>

                    <div className="privacy-group">
                      <h3>Study Collaboration</h3>
                      
                      <div className="study-buddies-card">
                        <div className="study-buddies-content">
                          <div className="study-buddies-icon">👥</div>
                          <div className="study-buddies-info">
                            <h4>Study Buddies</h4>
                            <p>Connect with friends and classmates to share study schedules, coordinate group sessions, and stay motivated together.</p>
                            <div className="study-buddies-features">
                              <span className="feature-tag">📅 Share Schedules</span>
                              <span className="feature-tag">🤝 Group Study</span>
                              <span className="feature-tag">💬 Study Chat</span>
                            </div>
                          </div>
                        </div>
                        <button className="study-buddies-button">
                          Add Study Buddies
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appearance Section */}
                <div className="preferences-section">
                  <h2>Appearance</h2>
                  <div className="section-content">
                    <p>Customize the look and feel of your Class Catcher interface, themes, and visual preferences.</p>
                    
                    <div className="appearance-group">
                      <h3>Theme & Colors</h3>
                      
                      <div className="appearance-item">
                        <div className="appearance-info">
                          <h4>Theme Mode</h4>
                          <p>Choose between dark mode for low-light environments or light mode for a clean, bright interface.</p>
                          <div className="theme-preview">
                            <div className={`theme-preview-card ${isDarkMode ? 'dark' : 'light'}`}>
                              <div className="preview-header"></div>
                              <div className="preview-content">
                                <div className="preview-line"></div>
                                <div className="preview-line short"></div>
                                <div className="preview-line"></div>
                              </div>
                            </div>
                            <span className="theme-label">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                          </div>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={isDarkMode}
                            onChange={handleThemeToggle}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="appearance-item">
                        <div className="appearance-info">
                          <h4>Accent Color</h4>
                          <p>Choose your preferred accent color for buttons, highlights, and interactive elements throughout the app.</p>
                          <div className="color-preview" style={{ backgroundColor: accentColor }}>
                            <span className="color-name">{accentColor}</span>
                          </div>
                        </div>
                        <div className="accent-color-picker">
                          <div className="color-options">
                            {accentColors.map((color) => (
                              <button
                                key={color}
                                className={`accent-color-option ${accentColor === color ? 'selected' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => handleAccentColorChange(color)}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons - Only show when unlocked */}
          {isUnlocked && (
            <div className="preferences-actions">
              <button className="primary-button" onClick={handleSaveAndContinue}>
                Save & Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
