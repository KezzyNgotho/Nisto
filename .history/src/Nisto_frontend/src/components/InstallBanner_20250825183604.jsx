import React from 'react';
import { useInstall } from '../contexts/InstallContext';
import { FiDownload, FiX, FiInfo } from 'react-icons/fi';
import './InstallBanner.scss';

const InstallBanner = () => {
  const { 
    showInstallBanner, 
    isInstallable, 
    isLoading, 
    handleInstallClick, 
    dismissBanner,
    showModal 
  } = useInstall();

  if (!showInstallBanner || !isInstallable) {
    return null;
  }

  return (
    <div className="install-banner">
      <div className="install-banner-content">
        <div className="install-banner-info">
          <FiInfo className="install-banner-icon" />
          <div className="install-banner-text">
            <h4>Install Nesto</h4>
            <p>Get the best experience with our native app</p>
          </div>
        </div>
        
        <div className="install-banner-actions">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={showModal}
          >
            <FiInfo />
            Learn More
          </button>
          
          <button 
            className="btn btn-primary btn-sm"
            onClick={handleInstallClick}
            disabled={isLoading}
          >
            <FiDownload />
            {isLoading ? 'Installing...' : 'Install'}
          </button>
          
          <button 
            className="btn btn-icon btn-sm"
            onClick={dismissBanner}
            aria-label="Dismiss"
          >
            <FiX />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallBanner;
