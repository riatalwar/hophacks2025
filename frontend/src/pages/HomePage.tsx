import { Link } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { FloatingCard } from '../components/FloatingCard';
import { FeatureCard } from '../components/FeatureCard';
import '../styles/HomePage.css';

export function HomePage() {
  return (
    <div className="app">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Catch Your Classes
            <span className="gradient-text"> Effortlessly</span>
          </h1>
          <p className="hero-subtitle">
            The ultimate platform for organizing course materials, managing syllabi, 
            and creating efficient study schedules that actually work.
          </p>
          <div className="hero-buttons">
            <Link to="/activities" className="primary-button">Start Organizing</Link>
            <Link to="/about" className="secondary-button">Learn More</Link>
          </div>
        </div>
        <div className="hero-visual">
          <FloatingCard icon="📚" text="Course Links" position="card-1" />
          <FloatingCard icon="📄" text="Syllabi" position="card-2" />
          <FloatingCard icon="📅" text="Study Schedule" position="card-3" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Everything You Need to Succeed</h2>
          <div className="features-grid">
            <FeatureCard
              icon="🔗"
              title="Course Link Management"
              description="Drop and organize all your course websites, lecture recordings, and important resources in one centralized location."
            />
            <FeatureCard
              icon="📋"
              title="Syllabi Upload & Analysis"
              description="Upload your syllabi and let our AI extract key dates, assignments, and important information automatically."
            />
            <FeatureCard
              icon="⏰"
              title="Smart Study Scheduler"
              description="Create personalized study schedules based on your course load, deadlines, and learning preferences."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Academic Life?</h2>
            <p>Join thousands of students who have already streamlined their study process with Schedule Sort.</p>
            <Link to="/activities" className="primary-button large">Get Started Today</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>Schedule Sort</h3>
              <p>Your academic success, simplified.</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#">Features</a>
                <a href="#">Pricing</a>
                <a href="#">Updates</a>
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <a href="#">Help Center</a>
                <a href="#">Contact Us</a>
                <a href="#">Community</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#">About</a>
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Schedule Sort. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
