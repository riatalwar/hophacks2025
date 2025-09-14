import { useState, useEffect, useCallback, useRef } from 'react';
import { Navigation } from '../components/Navigation';
import { WeekCalendar } from '../components/WeekCalendar';
import type { StudyTimeList, StudyTimeNode, Preferences } from '../types/ClassTypes';
import { usePreferences } from '../hooks/usePreferences';
import '../styles/Preferences.css';

export function Preferences() {
  // Use the backend integration hook
  const { 
    preferences, 
    loading, 
    error, 
    savePreferences, 
    updatePreferences 
  } = usePreferences();

  // Local state for UI
  const [, setStudySchedule] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{success: boolean; message: string} | null>(null);

  // Calendar import state
  const [selectedIcsFile, setSelectedIcsFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{success: boolean; message: string} | null>(null);
  const [importedCalendars, setImportedCalendars] = useState<Array<{
    id: string;
    name: string;
    fileName: string;
    importDate: string;
    eventCount: number;
  }>>([]);

  // Note: ICS import functionality removed - externalTimeBlocks not needed

  // Derived state from preferences
  const emailNotifications = preferences ? {
    studyReminders: preferences.studyReminders,
    assignmentDeadlines: preferences.assignmentDeadlines,
    weeklyDigest: preferences.weeklyDigest,
    courseUpdates: preferences.courseUpdates,
    systemAlerts: preferences.systemAlerts
  } : {
    studyReminders: true,
    assignmentDeadlines: true,
    weeklyDigest: false,
    courseUpdates: true,
    systemAlerts: true
  };

  const shareDataAnonymously = preferences?.shareDataAnonymously ?? false;
  const isDarkMode = preferences?.isDarkMode ?? true;
  const accentColor = preferences?.accentColor ?? '#4ecdc4';
  const wakeUpTimes = preferences?.wakeUpTimes ?? [0, 0, 0, 0, 0, 0, 0];
  const bedtimes = preferences?.bedtimes ?? [0, 0, 0, 0, 0, 0, 0];
  const busyTimes = preferences?.busyTimes ?? [
    { head: null, size: 0 }, // Monday
    { head: null, size: 0 }, // Tuesday
    { head: null, size: 0 }, // Wednesday
    { head: null, size: 0 }, // Thursday
    { head: null, size: 0 }, // Friday
    { head: null, size: 0 }, // Saturday
    { head: null, size: 0 }  // Sunday
  ];

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

  // Comprehensive function to save all preferences to backend
  const saveAllPreferences = useCallback(async () => {
    if (!preferences) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const currentPreferences = {
        wakeUpTimes,
        bedtimes,
        busyTimes,
        studyReminders: emailNotifications.studyReminders,
        assignmentDeadlines: emailNotifications.assignmentDeadlines,
        weeklyDigest: emailNotifications.weeklyDigest,
        courseUpdates: emailNotifications.courseUpdates,
        systemAlerts: emailNotifications.systemAlerts,
        shareDataAnonymously,
        isDarkMode,
        accentColor
      };

      const success = await savePreferences(currentPreferences);
      
      if (success) {
        setSaveMessage({ success: true, message: 'Preferences saved successfully!' });
        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ success: false, message: 'Failed to save preferences' });
      }
    } catch (error) {
      setSaveMessage({ 
        success: false, 
        message: `Error saving preferences: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setIsSaving(false);
    }
  }, [preferences, wakeUpTimes, bedtimes, busyTimes, emailNotifications, shareDataAnonymously, isDarkMode, accentColor, savePreferences]);

  // Create a stable reference to saveAllPreferences using useRef
  const saveAllPreferencesRef = useRef(saveAllPreferences);
  saveAllPreferencesRef.current = saveAllPreferences;

  // Note: Preferences are now loaded via the usePreferences hook from backend

  // Function to sync wake up times from WeekCalendar
  const handleWakeUpTimesChange = useCallback(async (newWakeUpTimes: { [day: number]: any | null }) => {
    const wakeUpArray = [0, 0, 0, 0, 0, 0, 0];
    Object.entries(newWakeUpTimes).forEach(([day, wakeTime]) => {
      if (wakeTime && wakeTime.startTime !== undefined) {
        wakeUpArray[parseInt(day)] = wakeTime.startTime;
      }
    });
    
    // Update backend
    await updatePreferences({
      wakeUpTimes: wakeUpArray
    });
  }, [updatePreferences]);

  // Function to sync bedtimes from WeekCalendar
  const handleBedtimesChange = useCallback(async (newBedtimes: { [day: number]: any | null }) => {
    const bedtimesArray = [0, 0, 0, 0, 0, 0, 0];
    Object.entries(newBedtimes).forEach(([day, bedtime]) => {
      if (bedtime && bedtime.startTime !== undefined) {
        bedtimesArray[parseInt(day)] = bedtime.startTime;
      }
    });
    
    // Update backend
    await updatePreferences({
      bedtimes: bedtimesArray
    });
  }, [updatePreferences]);

  // Function to sync busy times from WeekCalendar
  const handleBusyTimesChange = useCallback(async (newBusyTimes: any[]) => {
    // Convert busy times array to StudyTimeList format
    const busyTimesList: StudyTimeList[] = [
      { head: null, size: 0 }, // Monday
      { head: null, size: 0 }, // Tuesday
      { head: null, size: 0 }, // Wednesday
      { head: null, size: 0 }, // Thursday
      { head: null, size: 0 }, // Friday
      { head: null, size: 0 }, // Saturday
      { head: null, size: 0 }  // Sunday
    ];

    // Group busy times by day and convert to linked list format
    newBusyTimes.forEach((timeBlock) => {
      if (timeBlock.day !== undefined && timeBlock.startTime !== undefined && timeBlock.endTime !== undefined) {
        const day = timeBlock.day;
        const node: StudyTimeNode = {
          data: [timeBlock.startTime, timeBlock.endTime],
          next: null
        };
        
        if (busyTimesList[day].head === null) {
          busyTimesList[day].head = node;
        } else {
          // Add to end of linked list
          let current = busyTimesList[day].head;
          while (current.next !== null) {
            current = current.next;
          }
          current.next = node;
        }
        busyTimesList[day].size++;
      }
    });

    // Update backend
    await updatePreferences({
      busyTimes: busyTimesList
    });
  }, [updatePreferences]);

  const handleNotificationToggle = async (notificationType: keyof typeof emailNotifications) => {
    const newValue = !emailNotifications[notificationType];
    
    // Update backend immediately
    await updatePreferences({
      [notificationType]: newValue
    });
  };

  const handleDataSharingToggle = async () => {
    const newValue = !shareDataAnonymously;
    
    // Update backend immediately
    await updatePreferences({
      shareDataAnonymously: newValue
    });
  };

  const handleThemeToggle = async () => {
    const newTheme = !isDarkMode;

    // Apply theme immediately for better UX
    if (newTheme) {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.classList.add('light-theme');
    }

    // Update backend
    await updatePreferences({
      isDarkMode: newTheme
    });
  };

  const handleAccentColorChange = async (color: string) => {
    // Apply accent color immediately for better UX
    document.documentElement.style.setProperty('--accent-color', color);

    // Also set the light variant (slightly different shade)
    const lightVariant = getAccentColorLightVariant(color);
    document.documentElement.style.setProperty('--accent-color-light', lightVariant);
    
    // Set gradient variables
    document.documentElement.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${color} 0%, ${lightVariant} 100%)`);
    document.documentElement.style.setProperty('--accent-gradient-hover', `linear-gradient(135deg, ${lightVariant} 0%, ${color} 100%)`);

    // Update backend
    await updatePreferences({
      accentColor: color
    });
  };

  // Calendar import handlers
  const handleIcsFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.ics')) {
      setSelectedIcsFile(file);
      setImportResult(null);
    } else {
      setImportResult({
        success: false,
        message: 'Please select a valid .ics file'
      });
    }
  };

  const handleRemoveIcsFile = () => {
    setSelectedIcsFile(null);
    setImportResult(null);
  };

  const handleRemoveImportedCalendar = (calendarId: string) => {
    setImportedCalendars(prev => prev.filter(cal => cal.id !== calendarId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleImportIcs = async () => {
    if (!selectedIcsFile) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful import
      const newCalendar = {
        id: Date.now().toString(),
        name: selectedIcsFile.name.replace('.ics', ''),
        fileName: selectedIcsFile.name,
        importDate: new Date().toLocaleDateString(),
        eventCount: Math.floor(Math.random() * 20) + 5 // Mock event count
      };

      setImportedCalendars(prev => [...prev, newCalendar]);
      
      setImportResult({
        success: true,
        message: `Successfully imported ${selectedIcsFile.name} with ${newCalendar.eventCount} events`
      });

      // Clear the file after successful import
      setTimeout(() => {
        setSelectedIcsFile(null);
        setImportResult(null);
      }, 3000);

    } catch (error) {
      setImportResult({
        success: false,
        message: 'Failed to import calendar file. Please try again.'
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Apply initial theme and accent color on component mount
  useEffect(() => {
    // Apply initial accent color
    document.documentElement.style.setProperty('--accent-color', accentColor);

    // Apply initial accent color light variant
    const lightVariant = getAccentColorLightVariant(accentColor);
    document.documentElement.style.setProperty('--accent-color-light', lightVariant);
    
    // Set gradient variables
    document.documentElement.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${accentColor} 0%, ${lightVariant} 100%)`);
    document.documentElement.style.setProperty('--accent-gradient-hover', `linear-gradient(135deg, ${lightVariant} 0%, ${accentColor} 100%)`);

    // Apply initial theme
    if (isDarkMode) {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.classList.add('light-theme');
    }
  }, [accentColor, isDarkMode]); // Include dependencies that are used in the effect

  // Show loading state
  if (loading) {
    return (
      <>
        <Navigation />
        <div className="preferences-page">
          <div className="preferences-container">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading your preferences...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <Navigation />
        <div className="preferences-page">
          <div className="preferences-container">
            <div className="error-state">
              <h2>Error Loading Preferences</h2>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="preferences-page">
        <div className="preferences-container">
        <div className="preferences-header">
          <h1>Preferences & Settings</h1>
          <p>Customize your Schedule Sort experience to match your study preferences and academic needs.</p>
          
          {/* Save Message */}
          {saveMessage && (
            <div className={`save-message ${saveMessage.success ? 'success' : 'error'}`}>
              {saveMessage.success ? '✅' : '❌'} {saveMessage.message}
            </div>
          )}
          
          {/* Saving Indicator */}
          {isSaving && (
            <div className="saving-indicator">
              <div className="saving-spinner"></div>
              <span>Saving preferences...</span>
            </div>
          )}
        </div>

        <div className="preferences-content">
          <div className="preferences-grid">
            {/* Calendar Import Section */}
            <div className="preferences-section calendar-import">
              <h2>Calendar Import</h2>
              <div className="section-content">
                <p>Import your existing class schedule from a .ics calendar file to automatically populate your study preferences.</p>
                
                <div className="calendar-import-group">
                  <div className="file-upload-area">
                    <div className="file-upload-content">
                      <div className="upload-icon">📅</div>
                      <h3>Upload .ics File</h3>
                      <p>Drag and drop your .ics file here, or click to browse</p>
                      <input
                        type="file"
                        id="ics-file-input"
                        accept=".ics"
                        onChange={handleIcsFileUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="ics-file-input" className="file-upload-button">
                        Choose File
                      </label>
                    </div>
                    {selectedIcsFile && (
                      <div className="file-selected">
                        <div className="file-info">
                          <span className="file-icon">📄</span>
                          <span className="file-name">{selectedIcsFile.name}</span>
                          <span className="file-size">({formatFileSize(selectedIcsFile.size)})</span>
                        </div>
                        <button 
                          className="remove-file-button"
                          onClick={handleRemoveIcsFile}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Imported Calendars List */}
                  {importedCalendars.length > 0 && (
                    <div className="imported-calendars">
                      <h4>Imported Calendars</h4>
                      <div className="calendars-list">
                        {importedCalendars.map((calendar) => (
                          <div key={calendar.id} className="calendar-item">
                            <div className="calendar-info">
                              <div className="calendar-icon">📅</div>
                              <div className="calendar-details">
                                <h5>{calendar.name}</h5>
                                <p className="calendar-meta">
                                  {calendar.eventCount} events • Imported {calendar.importDate}
                                </p>
                                <p className="calendar-filename">{calendar.fileName}</p>
                              </div>
                            </div>
                            <button 
                              className="remove-calendar-button"
                              onClick={() => handleRemoveImportedCalendar(calendar.id)}
                              title="Remove calendar"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="import-actions">
                    <button 
                      className="import-button"
                      onClick={handleImportIcs}
                      disabled={!selectedIcsFile || isImporting}
                    >
                      {isImporting ? 'Importing...' : 'Import Calendar'}
                    </button>
                    {importResult && (
                      <div className={`import-result ${importResult.success ? 'success' : 'error'}`}>
                        {importResult.success ? '✅' : '❌'} {importResult.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Study Preferences Section */}
            <div className="preferences-section study-preferences">
              <h2>Study Preferences</h2>
              <div className="section-content">
                <p>Customize your study schedule, learning style, and academic preferences to optimize your Schedule Sort experience.</p>
                <WeekCalendar 
                  onScheduleChange={handleScheduleChange}
                  onWakeUpTimesChange={handleWakeUpTimesChange}
                  onBedtimesChange={handleBedtimesChange}
                  onStudyTimesChange={handleBusyTimesChange}
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
                        <p>Important updates about Schedule Sort features and maintenance</p>
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
                      <p>Help improve Schedule Sort for everyone by sharing anonymous usage data. This helps us understand how students study and optimize features for better academic success.</p>
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
                <p>Customize the look and feel of your Schedule Sort interface, themes, and visual preferences.</p>

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