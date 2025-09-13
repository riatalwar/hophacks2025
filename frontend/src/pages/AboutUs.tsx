import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import '../styles/AboutUs.css';

export function AboutUs() {
  return (
    <div className="about-us-page">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="about-container">
        {/* Hero Section */}
        <div className="about-hero">
          <h1>Meet the Team</h1>
          <p className="about-subtitle">
            We're Johns Hopkins Students. Studying needed to be made easier, so we created a way to "catch" the content of your classes and propel you towards success. Try it out!
          </p>
        </div>

        {/* Student Images Grid */}
        <div className="students-section">
          <div className="students-grid">
            <div className="student-card">
              <div className="student-image-placeholder">
                <div className="placeholder-icon">👨‍🎓</div>
                <span>Student Photo</span>
              </div>
              <div className="student-info">
                <h3>Team Member 1</h3>
                <p>Computer Science</p>
              </div>
            </div>

            <div className="student-card">
              <div className="student-image-placeholder">
                <div className="placeholder-icon">👩‍🎓</div>
                <span>Student Photo</span>
              </div>
              <div className="student-info">
                <h3>Team Member 2</h3>
                <p>Engineering</p>
              </div>
            </div>

            <div className="student-card">
              <div className="student-image-placeholder">
                <div className="placeholder-icon">👨‍🎓</div>
                <span>Student Photo</span>
              </div>
              <div className="student-info">
                <h3>Team Member 3</h3>
                <p>Data Science</p>
              </div>
            </div>

            <div className="student-card">
              <div className="student-image-placeholder">
                <div className="placeholder-icon">👩‍🎓</div>
                <span>Student Photo</span>
              </div>
              <div className="student-info">
                <h3>Team Member 4</h3>
                <p>Mathematics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="mission-section">
          <div className="mission-content">
            <h2>Our Mission</h2>
            <p>
              As students ourselves, we understand the challenges of managing multiple courses, 
              keeping track of assignments, and staying organized throughout the semester. 
              Class Catcher was born from our own struggles and our desire to make academic 
              life more manageable for students everywhere.
            </p>
            <p>
              We believe that with the right tools, every student can excel. That's why we've 
              created an intuitive platform that helps you organize course materials, manage 
              syllabi, and create effective study schedules that actually work.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="about-cta">
          <h2>Ready to Transform Your Study Experience?</h2>
          <p>Join thousands of students who are already using Class Catcher to stay organized and succeed.</p>
          <div className="cta-buttons">
            <Link to="/classes" className="primary-button">Get Started Now</Link>
            <Link to="/" className="secondary-button">Learn More Features</Link>
          </div>
        </div>

        {/* Johns Hopkins Branding */}
        <div className="university-branding">
          <div className="university-info">
            <h3>Built at Johns Hopkins University</h3>
            <p>Created by students, for students</p>
            <div className="university-details">
              <span>📍 Baltimore, Maryland</span>
              <span>🎓 Class of 2025</span>
              <span>💡 Innovation in Education</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
