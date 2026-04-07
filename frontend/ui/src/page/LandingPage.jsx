import React from 'react';
import { FiArrowRight, FiBook, FiZap, FiTrendingUp } from 'react-icons/fi';
import '../styles/landing.css';

const LandingPage = ({ onProceed }) => {
  return (
    <div className="landing-container">
      {/* Background gradients */}
      <div className="landing-bg-gradient"></div>
      <div className="landing-bg-glow"></div>

      {/* Main content */}
      <div className="landing-content">
        {/* Hero section */}
        <div className="landing-hero">
          <h1 className="landing-title">
            <span className="landing-gradient-text">AI-Powered</span> Study Assistant
          </h1>
          <p className="landing-subtitle">
            Transform your documents into interactive learning experiences with AI-driven insights
          </p>
        </div>

        {/* Cards grid */}
        <div className="landing-cards-grid">
          <div className="landing-feature-card">
            <FiBook className="landing-card-icon" />
            <h3>Smart Learning</h3>
            <p>Teach mode explains concepts from first principles</p>
          </div>

          <div className="landing-feature-card">
            <FiZap className="landing-card-icon" />
            <h3>Visual Diagrams</h3>
            <p>Auto-generated Mermaid diagrams for complex topics</p>
          </div>

          <div className="landing-feature-card">
            <FiTrendingUp className="landing-card-icon" />
            <h3>Socratic Method</h3>
            <p>Guided questioning to deepen understanding</p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onProceed}
          className="landing-cta-button"
        >
          Start Learning
          <FiArrowRight />
        </button>

        {/* Footer info */}
        <div className="landing-footer-info">
          <p>Upload your PDF in the next step to get started instantly</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
