import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

  const handleLogoClick = () => {
    navigate('/home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              <a href="#features">Features</a>
              <Link to="/about">About</Link>
              <Link to="/classes" className="cta-button">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

