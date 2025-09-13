import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Navigation component props interface
interface NavigationProps {
  showBackButton?: boolean;
  backTo?: string;
  backText?: string;
}

// Main Navigation component
export function Navigation({ 
  showBackButton = false, 
  backTo = '/', 
  backText = '← Back to Home' 
}: NavigationProps) {
  // React Router hook for navigation
  const navigate = useNavigate();
  
  // Authentication hook to get current user and sign out function
  const { currentUser, signOut } = useAuth();

  /**
   * Universal navigation handler that intelligently handles page transitions
   * @param targetPath - The path to navigate to
   * @param scrollToTop - Whether to scroll to top after navigation (default: true)
   */
  const handleNavigation = (targetPath: string, scrollToTop: boolean = true) => {
    // Simple, reliable navigation
    navigate(targetPath);
    
    // Scroll to top after navigation
    if (scrollToTop) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  /**
   * Special handler for Features button - navigates to home and scrolls to features section
   */
  const handleFeaturesClick = () => {
    handleNavigation('/home', false); // Don't scroll to top initially
    
    // Scroll to features section after page loads
    setTimeout(() => {
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  /**
   * Handler for logo click - navigates to home page
   */
  const handleLogoClick = () => {
    handleNavigation('/home');
  };

  /**
   * Handler for logout - signs out user and navigates to home
   */
  const handleLogout = async () => {
    try {
      await signOut();
      handleNavigation('/home');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still navigate to home even if logout fails
      handleNavigation('/home');
    }
  };

  /**
   * Handler for back button - navigates to specified back route
   */
  const handleBackClick = () => {
    handleNavigation(backTo);
  };

  /**
   * Creates a navigation link with proper click handling
   * @param to - The path to navigate to
   * @param children - The link text/content
   * @param className - CSS class for styling
   * @param onClick - Optional custom click handler
   */
  const NavLink = ({ 
    to, 
    children, 
    className = '', 
    onClick 
  }: { 
    to: string; 
    children: React.ReactNode; 
    className?: string; 
    onClick?: () => void;
  }) => {
    const handleClick = (e: React.MouseEvent) => {
      // Always prevent default to ensure our handler runs
      e.preventDefault();
      
      // If custom onClick is provided, use it
      if (onClick) {
        onClick();
        return;
      }
      
      // Otherwise, use universal navigation
      handleNavigation(to);
    };

    return (
      <Link 
        to={to} 
        className={className}
        onClick={handleClick}
      >
        {children}
      </Link>
    );
  };

  /**
   * Creates a navigation button with proper click handling
   * @param children - The button text/content
   * @param className - CSS class for styling
   * @param onClick - Click handler function
   */
  const NavButton = ({ 
    children, 
    className = '', 
    onClick 
  }: { 
    children: React.ReactNode; 
    className?: string; 
    onClick: () => void;
  }) => {
    return (
      <button 
        className={className}
        onClick={onClick}
      >
        {children}
      </button>
    );
  };

  // Render the navigation bar
  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo section */}
        <div className="nav-logo">
          <NavButton 
            onClick={handleLogoClick} 
            className="logo-button"
          >
            <h2>Class Catcher</h2>
          </NavButton>
        </div>

        {/* Navigation links section */}
        <div className="nav-links">
          {showBackButton ? (
            // Back button mode (for specific pages that need it)
            <NavButton 
              onClick={handleBackClick}
              className="back-button"
            >
              {backText}
            </NavButton>
          ) : (
            // Standard navigation mode
            <>
              {/* Features button - always visible */}
              <NavButton 
                onClick={handleFeaturesClick}
                className="nav-link-button"
              >
                Features
              </NavButton>

              {/* About link - always visible */}
              <NavLink 
                to="/about"
                className="nav-link"
              >
                About
              </NavLink>

              {/* Conditional navigation based on authentication status */}
              {currentUser ? (
                // Authenticated user navigation
                <>
                  <NavLink 
                    to="/dashboard"
                    className="cta-button"
                  >
                    Dashboard
                  </NavLink>
                  
                  <NavLink 
                    to="/preferences"
                    className="nav-link"
                  >
                    Settings
                  </NavLink>
                  
                  <NavButton 
                    onClick={handleLogout}
                    className="logout-button"
                  >
                    Logout
                  </NavButton>
                </>
              ) : (
                // Unauthenticated user navigation
                <>
                  <NavLink 
                    to="/login"
                    className="secondary-button"
                  >
                    Login
                  </NavLink>
                  
                  <NavLink 
                    to="/activities"
                    className="cta-button"
                  >
                    Get Started
                  </NavLink>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}