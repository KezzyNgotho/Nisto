import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../ui/ToastManager';
import Onboarding from '../ui/Onboarding';
import './UserOnboarding.css';

const UserOnboarding = ({ onComplete }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();
  const { success } = useToast();

  useEffect(() => {
    // Check if user needs onboarding
    const needsOnboarding = !localStorage.getItem('nisto-user-onboarding-completed');
    if (needsOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const onboardingSteps = [
    {
      title: "Welcome to Nisto! 🎉",
      description: "Your gateway to the future of social finance. Let's get you started with a quick tour of our platform.",
      icon: "🚀",
      content: (
        <div className="onboarding-welcome">
          <div className="welcome-features">
            <div className="feature-item">
              <span className="feature-icon">💳</span>
              <span>Multi-currency crypto wallets</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👥</span>
              <span>Group vaults for collaborative savings</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📱</span>
              <span>Social media money transfers</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🤖</span>
              <span>AI-powered financial insights</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Secure Your Wallet 🔐",
      description: "Your security is our priority. Learn how to protect your digital assets with our advanced security features.",
      icon: "🛡️",
      content: (
        <div className="onboarding-security">
          <div className="security-tips">
            <div className="security-tip">
              <div className="tip-icon">🔑</div>
              <div className="tip-content">
                <h4>Private Keys</h4>
                <p>Your keys are stored securely and never shared with third parties.</p>
              </div>
            </div>
            <div className="security-tip">
              <div className="tip-icon">🔒</div>
              <div className="tip-content">
                <h4>Multi-Factor Authentication</h4>
                <p>Enable 2FA for additional security on all transactions.</p>
              </div>
            </div>
            <div className="security-tip">
              <div className="tip-icon">👥</div>
              <div className="tip-content">
                <h4>MPC Wallets</h4>
                <p>Create multi-party wallets requiring multiple approvals for transactions.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Explore Features 🌟",
      description: "Discover the powerful features that make Nisto the leading DeFi platform in Africa.",
      icon: "✨",
      content: (
        <div className="onboarding-features">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card__icon">💸</div>
              <h4>Bill Payments</h4>
              <p>Pay utilities, mobile bills, and more with crypto</p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">🔄</div>
              <h4>Token Swaps</h4>
              <p>Exchange tokens instantly with minimal fees</p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">📊</div>
              <h4>Market Data</h4>
              <p>Real-time prices and market insights</p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">💬</div>
              <h4>Social Trading</h4>
              <p>Connect with other traders and share strategies</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Get Started! 🎯",
      description: "You're all set! Start exploring Nisto and discover the future of finance.",
      icon: "🎊",
      content: (
        <div className="onboarding-complete">
          <div className="complete-actions">
            <div className="action-item">
              <div className="action-icon">💳</div>
              <div className="action-content">
                <h4>Create Your First Wallet</h4>
                <p>Set up your crypto wallet to start managing your digital assets</p>
              </div>
            </div>
            <div className="action-item">
              <div className="action-icon">👥</div>
              <div className="action-content">
                <h4>Join a Group Vault</h4>
                <p>Collaborate with friends and family on savings goals</p>
              </div>
            </div>
            <div className="action-item">
              <div className="action-icon">📱</div>
              <div className="action-content">
                <h4>Connect Social Media</h4>
                <p>Link your social accounts for seamless money transfers</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleOnboardingComplete = () => {
    localStorage.setItem('nisto-user-onboarding-completed', 'true');
    setShowOnboarding(false);
    success('Welcome to Nisto! You\'re all set to explore the future of finance.');
    onComplete?.();
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('nisto-user-onboarding-completed', 'true');
    setShowOnboarding(false);
    onComplete?.();
  };

  if (!showOnboarding) {
    return null;
  }

  return (
    <Onboarding
      steps={onboardingSteps}
      onComplete={handleOnboardingComplete}
      onSkip={handleOnboardingSkip}
      showProgress={true}
      allowSkip={true}
    />
  );
};

export default UserOnboarding;
