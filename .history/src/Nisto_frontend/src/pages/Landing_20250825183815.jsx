import React from 'react';
import { useInstall } from '../contexts/InstallContext';
import { useAuth } from '../contexts/AuthContext';
import { FiDownload, FiZap, FiShield, FiSmartphone } from 'react-icons/fi';
import './Landing.scss';

const Landing = () => {
  const { isInstallable, isLoading, handleInstallClick, showModal } = useInstall();
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-page">
      <div className="landing-hero">
        <div className="hero-content">
          <h1>Welcome to Nesto</h1>
          <p>Your decentralized finance platform on the Internet Computer</p>
          
          <div className="hero-actions">
            {isInstallable ? (
              <button 
                className="btn btn-primary btn-large"
                onClick={handleInstallClick}
                disabled={isLoading}
              >
                <FiDownload />
                {isLoading ? 'Installing...' : 'Install Nesto'}
              </button>
            ) : (
              <button 
                className="btn btn-secondary btn-large"
                onClick={() => window.location.href = '/dashboard'}
              >
                Open Nesto
              </button>
            )}
            
            {!isAuthenticated && (
              <button 
                className="btn btn-outline"
                onClick={() => {/* Connect wallet logic */}}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="landing-features">
        <div className="feature">
          <FiZap className="feature-icon" />
          <h3>Fast & Secure</h3>
          <p>Lightning-fast transactions with enterprise-grade security</p>
        </div>
        
        <div className="feature">
          <FiShield className="feature-icon" />
          <h3>Decentralized</h3>
          <p>Built on the Internet Computer for true decentralization</p>
        </div>
        
        <div className="feature">
          <FiSmartphone className="feature-icon" />
          <h3>Mobile Ready</h3>
          <p>Install as a native app for the best mobile experience</p>
        </div>
      </div>

      {isInstallable && (
        <div className="landing-install-cta">
          <h2>Get the Best Experience</h2>
          <p>Install Nesto as a native app for faster performance and offline access</p>
          <button 
            className="btn btn-primary"
            onClick={showModal}
          >
            Learn More About Installation
          </button>
        </div>
      )}
    </div>
  );
};

export default Landing; 