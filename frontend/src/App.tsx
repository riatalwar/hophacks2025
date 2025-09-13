import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Dashboard } from './pages/Dashboard'
import { HomePage } from './pages/HomePage'
import { ActivityInput } from './pages/ActivityInput'
import { Preferences } from './pages/Preferences'
import { AboutUs } from './pages/AboutUs'
import { ProtectedRoute } from './components/ProtectedRoute'
import './App.css'
import './styles/GlobalTheme.css'

function App() {
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

  // Apply saved theme and accent color preferences on app load
  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('classCatcher_theme');
    if (savedTheme) {
      if (savedTheme === 'dark') {
        document.documentElement.classList.remove('light-theme');
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
        document.documentElement.classList.add('light-theme');
      }
    }

    // Load saved accent color
    const savedAccentColor = localStorage.getItem('classCatcher_accentColor');
    if (savedAccentColor) {
      document.documentElement.style.setProperty('--accent-color', savedAccentColor);

      // Also set the light variant
      const lightVariant = getAccentColorLightVariant(savedAccentColor);
      document.documentElement.style.setProperty('--accent-color-light', lightVariant);
      
      // Set gradient variables
      document.documentElement.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${savedAccentColor} 0%, ${lightVariant} 100%)`);
      document.documentElement.style.setProperty('--accent-gradient-hover', `linear-gradient(135deg, ${lightVariant} 0%, ${savedAccentColor} 100%)`);
    }
  }, []);
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/about" element={<AboutUs />} />
      <Route 
        path="/activities" 
        element={
          <ProtectedRoute>
            <ActivityInput />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/preferences" 
        element={
          <ProtectedRoute>
            <Preferences />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
