import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface NavigationProps {
  showBackButton?: boolean;
  backTo?: string;
  backText?: string;
}

export function Navigation({ 
  showBackButton = false, 
  backTo = '/', 
  backText = '← Back to Home' 
}: NavigationProps) {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();

  const handleLogoClick = () => {
    navigate('/home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/home');
  };

  const handleFeaturesClick = () => {
    navigate('/home');
    // Small delay to ensure page loads before scrolling
    setTimeout(() => {
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <button onClick={handleLogoClick} className="logo-button">
            <h2>Class Catcher</h2>
          </button>
        </div>
        <div className="nav-links">
          {showBackButton ? (
            <Link to={backTo}>{backText}</Link>
          ) : (
            <>
              <button onClick={handleFeaturesClick} className="nav-link-button">Features</button>
              <Link to="/about">About</Link>
              {currentUser ? (
                <>
                  <Link to="/dashboard" className="cta-button">Dashboard</Link>
                  <button onClick={handleLogout} className="logout-button">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="secondary-button">Login</Link>
                  <Link to="/activities" className="cta-button">Get Started</Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

