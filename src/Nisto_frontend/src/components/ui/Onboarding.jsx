import React, { useState, useEffect } from 'react';
import './Onboarding.css';

const Onboarding = ({ 
  steps = [],
  onComplete,
  onSkip,
  showProgress = true,
  allowSkip = true,
  startStep = 0
}) => {
  const [currentStep, setCurrentStep] = useState(startStep);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already completed onboarding
    const hasCompleted = localStorage.getItem('nisto-onboarding-completed');
    if (!hasCompleted) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('nisto-onboarding-completed', 'true');
    setIsVisible(false);
    onSkip?.();
  };

  const handleComplete = () => {
    localStorage.setItem('nisto-onboarding-completed', 'true');
    setIsVisible(false);
    onComplete?.();
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || !steps.length) {
    return null;
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-backdrop" onClick={handleClose} />
      
      <div className="onboarding-modal">
        <div className="onboarding-header">
          {showProgress && (
            <div className="onboarding-progress">
              <div className="onboarding-progress__bar">
                <div 
                  className="onboarding-progress__fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="onboarding-progress__text">
                {currentStep + 1} of {steps.length}
              </span>
            </div>
          )}
          
          <button 
            className="onboarding-close"
            onClick={handleClose}
            aria-label="Close onboarding"
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="onboarding-content">
          {step.icon && (
            <div className="onboarding-icon">
              {typeof step.icon === 'string' ? (
                <span className="onboarding-icon__emoji">{step.icon}</span>
              ) : (
                step.icon
              )}
            </div>
          )}

          <h2 className="onboarding-title">
            {step.title}
          </h2>

          <p className="onboarding-description">
            {step.description}
          </p>

          {step.content && (
            <div className="onboarding-step-content">
              {step.content}
            </div>
          )}

          {step.image && (
            <div className="onboarding-image">
              <img 
                src={step.image} 
                alt={step.title}
                className="onboarding-image__img"
              />
            </div>
          )}
        </div>

        <div className="onboarding-footer">
          <div className="onboarding-actions">
            {allowSkip && (
              <button 
                className="btn btn-ghost"
                onClick={handleSkip}
              >
                Skip Tour
              </button>
            )}
            
            <div className="onboarding-navigation">
              {currentStep > 0 && (
                <button 
                  className="btn btn-secondary"
                  onClick={handlePrevious}
                >
                  Previous
                </button>
              )}
              
              <button 
                className="btn btn-primary"
                onClick={handleNext}
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
