import React from 'react';
import { usePreferences } from '../hooks/usePreferences';

/**
 * Demo component showing how to use the preferences service
 * This component demonstrates how to access and modify user preferences
 * from any component in the application
 */
export function PreferencesDemo() {
  const { 
    preferences, 
    updatePreferences, 
    clearPreferences, 
    exportPreferences, 
    importPreferences,
    isLoading,
    error 
  } = usePreferences();

  const handleToggleDarkMode = () => {
    updatePreferences({ isDarkMode: !preferences.isDarkMode });
  };

  const handleChangeAccentColor = (color: string) => {
    updatePreferences({ accentColor: color });
  };

  const handleExport = () => {
    const json = exportPreferences();
    if (json) {
      // Create a download link
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'classcatcher-preferences.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          const success = importPreferences(content);
          if (success) {
            alert('Preferences imported successfully!');
          } else {
            alert('Failed to import preferences. Please check the file format.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  if (isLoading) {
    return <div>Loading preferences...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Preferences Demo</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Current Preferences:</h4>
        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
          {JSON.stringify(preferences, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Quick Actions:</h4>
        <button onClick={handleToggleDarkMode}>
          Toggle Dark Mode (Current: {preferences.isDarkMode ? 'Dark' : 'Light'})
        </button>
        
        <div style={{ marginTop: '10px' }}>
          <label>Accent Color: </label>
          <input
            type="color"
            value={preferences.accentColor}
            onChange={(e) => handleChangeAccentColor(e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Export/Import:</h4>
        <button onClick={handleExport}>Export Preferences</button>
        
        <div style={{ marginTop: '10px' }}>
          <label>Import Preferences: </label>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
          />
        </div>
      </div>

      <div>
        <button 
          onClick={clearPreferences}
          style={{ background: '#ff6b6b', color: 'white' }}
        >
          Clear All Preferences
        </button>
      </div>
    </div>
  );
}
