import { useState, useEffect, useCallback } from 'react';
import { Navigation } from '../components/Navigation';
import { WeekCalendar } from '../components/WeekCalendar';
import type { StudyTimeList, StudyTimeNode, Preferences } from '../types/ClassTypes';
import '../styles/Preferences.css';

export function Preferences() {
  const [, setStudySchedule] = useState<any[]>([]);
  const [emailNotifications, setEmailNotifications] = useState({
    studyReminders: true,
    assignmentDeadlines: true,
    weeklyDigest: false,
    courseUpdates: true,
    systemAlerts: true
  });
  const [shareDataAnonymously, setShareDataAnonymously] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('classCatcher_theme');
    return saved ? saved === 'dark' : true;
  });
  const [accentColor, setAccentColor] = useState(() => {
    const saved = localStorage.getItem('classCatcher_accentColor');
    return saved || '#4ecdc4';
  });

  // Wake up times and bedtimes arrays (7 days)
  const [wakeUpTimes, setWakeUpTimes] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [bedtimes, setBedtimes] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  // Array called studyTimes storing linked lists (of 2-value tuples) in each index
  const [studyTimes, setStudyTimes] = useState<StudyTimeList[]>([
    { head: null, size: 0 }, // Monday
    { head: null, size: 0 }, // Tuesday
    { head: null, size: 0 }, // Wednesday
    { head: null, size: 0 }, // Thursday
    { head: null, size: 0 }, // Friday
    { head: null, size: 0 }, // Saturday
    { head: null, size: 0 }  // Sunday
  ]);

  const accentColors = [
    '#4ecdc4', '#ff6b6b', '#45b7d1', '#96ceb4',
    '#feca57', '#ff9ff3', '#54a0ff', '#a55eea'
  ];

  // Helper function to generate a light variant of the accent color
  const getAccentColorLightVariant = (color: string): string => {
    // Simple mapping for the predefined colors
    const colorMap: { [key: string]: string } = {
      '#4ecdc4': '#45b7d1',
      '#ff6b6b': '#ff8e8e',
      '#45b7d1': '#5bc0de',
      '#96ceb4': '#a8d5ba',
      '#feca57': '#ffd93d',
      '#ff9ff3': '#ffb3f3',
      '#54a0ff': '#74b9ff',
      '#a55eea': '#c44569'
    };
    return colorMap[color] || color;
  };

  const handleScheduleChange = useCallback((schedule: any[]) => {
    setStudySchedule(schedule);
  }, []);

  // Comprehensive function to save all preferences
  const saveAllPreferences = useCallback(() => {
    const preferences: Preferences = {
      wakeUpTimes,
      bedtimes,
      studyTimes,
      studyReminders: emailNotifications.studyReminders,
      assignmentDeadlines: emailNotifications.assignmentDeadlines,
      weeklyDigest: emailNotifications.weeklyDigest,
      courseUpdates: emailNotifications.courseUpdates,
      systemAlerts: emailNotifications.systemAlerts,
      shareDataAnonymously,
      isDarkMode,
      accentColor
    };

    // Save to localStorage
    localStorage.setItem('classCatcher_preferences', JSON.stringify(preferences));
    
    // Also save individual theme and accent color for immediate application
    localStorage.setItem('classCatcher_theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('classCatcher_accentColor', accentColor);
    
    console.log('Preferences saved:', preferences);
  }, [wakeUpTimes, bedtimes, studyTimes, emailNotifications, shareDataAnonymously, isDarkMode, accentColor]);

  // Function to load all preferences
  const loadAllPreferences = useCallback(() => {
    const savedPreferences = localStorage.getItem('classCatcher_preferences');
    
    if (savedPreferences) {
      try {
        const preferences: Preferences = JSON.parse(savedPreferences);
        
        // Load wake up times and bedtimes
        if (preferences.wakeUpTimes) {
          setWakeUpTimes(preferences.wakeUpTimes);
        }
        if (preferences.bedtimes) {
          setBedtimes(preferences.bedtimes);
        }
        
        // Load study times
        if (preferences.studyTimes) {
          setStudyTimes(preferences.studyTimes);
        }
        
        // Load email notifications
        if (preferences.studyReminders !== undefined) {
          setEmailNotifications({
            studyReminders: preferences.studyReminders,
            assignmentDeadlines: preferences.assignmentDeadlines,
            weeklyDigest: preferences.weeklyDigest,
            courseUpdates: preferences.courseUpdates,
            systemAlerts: preferences.systemAlerts
          });
        }
        
        // Load privacy settings
        if (preferences.shareDataAnonymously !== undefined) {
          setShareDataAnonymously(preferences.shareDataAnonymously);
        }
        
        // Load appearance settings
        if (preferences.isDarkMode !== undefined) {
          setIsDarkMode(preferences.isDarkMode);
        }
        if (preferences.accentColor) {
          setAccentColor(preferences.accentColor);
        }
        
        console.log('Preferences loaded:', preferences);
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }
  }, []);

  // Load preferences on component mount
  useEffect(() => {
    //loadAllPreferences();
  }, [loadAllPreferences]);

  // Function to sync wake up times from WeekCalendar
  const handleWakeUpTimesChange = useCallback((newWakeUpTimes: { [day: number]: any | null }) => {
    const wakeUpArray = [0, 0, 0, 0, 0, 0, 0];
    Object.entries(newWakeUpTimes).forEach(([day, wakeTime]) => {
      if (wakeTime && wakeTime.startTime !== undefined) {
        wakeUpArray[parseInt(day)] = wakeTime.startTime;
      }
    });
    setWakeUpTimes(wakeUpArray);
    
    // Auto-save preferences
    setTimeout(() => saveAllPreferences(), 100);
  }, [saveAllPreferences]);

  // Function to sync bedtimes from WeekCalendar
  const handleBedtimesChange = useCallback((newBedtimes: { [day: number]: any | null }) => {
    const bedtimesArray = [0, 0, 0, 0, 0, 0, 0];
    Object.entries(newBedtimes).forEach(([day, bedtime]) => {
      if (bedtime && bedtime.startTime !== undefined) {
        bedtimesArray[parseInt(day)] = bedtime.startTime;
      }
    });
    setBedtimes(bedtimesArray);
    
    // Auto-save preferences
    setTimeout(() => saveAllPreferences(), 100);
  }, [saveAllPreferences]);

  // Function to sync study times from WeekCalendar
  const handleStudyTimesChange = useCallback((newStudyTimes: any[]) => {
    // Convert study times array to StudyTimeList format
    const studyTimesList: StudyTimeList[] = [
      { head: null, size: 0 }, // Monday
      { head: null, size: 0 }, // Tuesday
      { head: null, size: 0 }, // Wednesday
      { head: null, size: 0 }, // Thursday
      { head: null, size: 0 }, // Friday
      { head: null, size: 0 }, // Saturday
      { head: null, size: 0 }  // Sunday
    ];

    // Group study times by day and convert to linked list format
    newStudyTimes.forEach((timeBlock) => {
      if (timeBlock.day !== undefined && timeBlock.startTime !== undefined && timeBlock.endTime !== undefined) {
        const day = timeBlock.day;
        const node: StudyTimeNode = {
          data: [timeBlock.startTime, timeBlock.endTime],
          next: null
        };
        
        if (studyTimesList[day].head === null) {
          studyTimesList[day].head = node;
        } else {
          // Add to end of linked list
          let current = studyTimesList[day].head;
          while (current.next !== null) {
            current = current.next;
          }
          current.next = node;
        }
        studyTimesList[day].size++;
      }
    });

    setStudyTimes(studyTimesList);
    
    // Auto-save preferences
    setTimeout(() => saveAllPreferences(), 100);
  }, [saveAllPreferences]);

  const handleNotificationToggle = (notificationType: keyof typeof emailNotifications) => {
    setEmailNotifications(prev => ({
      ...prev,
      [notificationType]: !prev[notificationType]
    }));
    
    // Auto-save preferences
    setTimeout(() => saveAllPreferences(), 100);
  };

  const handleDataSharingToggle = () => {
    setShareDataAnonymously(prev => !prev);
    
    // Auto-save preferences
    setTimeout(() => saveAllPreferences(), 100);
  };

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    // Save to localStorage
    localStorage.setItem('classCatcher_theme', newTheme ? 'dark' : 'light');

    // Apply theme immediately
    if (newTheme) {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.classList.add('light-theme');
    }
    
    // Auto-save preferences
    setTimeout(() => saveAllPreferences(), 100);
  };

  const handleAccentColorChange = (color: string) => {
    setAccentColor(color);

    // Save to localStorage
    localStorage.setItem('classCatcher_accentColor', color);

    // Apply accent color immediately
    document.documentElement.style.setProperty('--accent-color', color);

    // Also set the light variant (slightly different shade)
    const lightVariant = getAccentColorLightVariant(color);
    document.documentElement.style.setProperty('--accent-color-light', lightVariant);
    
    // Set gradient variables
    document.documentElement.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${color} 0%, ${lightVariant} 100%)`);
    document.documentElement.style.setProperty('--accent-gradient-hover', `linear-gradient(135deg, ${lightVariant} 0%, ${color} 100%)`);
    
    // Auto-save preferences
    setTimeout(() => saveAllPreferences(), 100);
  };

  // Theme and accent color are handled globally by App.tsx
  // No need to apply them here to avoid conflicts that can freeze the navbar

  return (
    <>
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="preferences-page">
        <div className="preferences-container">
        <div className="preferences-header">
          <h1>Preferences & Settings</h1>
          <p>Customize your Class Catcher experience to match your study preferences and academic needs.</p>
        </div>

        <div className="preferences-content">
          <div className="preferences-grid">
            {/* Study Preferences Section */}
            <div className="preferences-section study-preferences">
              <h2>Study Preferences</h2>
              <div className="section-content">
                <p>Customize your study schedule, learning style, and academic preferences to optimize your Class Catcher experience.</p>
                <WeekCalendar 
                  onScheduleChange={handleScheduleChange}
                  onWakeUpTimesChange={handleWakeUpTimesChange}
                  onBedtimesChange={handleBedtimesChange}
                  onStudyTimesChange={handleStudyTimesChange}
                />
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
        </div>
        
        {/* Save Preferences Button */}
        <div className="preferences-save-section">
          <button 
            onClick={saveAllPreferences}
            className="save-preferences-button"
          >
            💾 Save All Preferences
          </button>
          <p className="save-info">
            Your preferences are automatically saved when you make changes, but you can also save manually here.
          </p>
        </div>
      </div>
      </div>
    </>
  );
}