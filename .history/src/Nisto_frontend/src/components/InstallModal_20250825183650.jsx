import React from 'react';
import { useInstall } from '../contexts/InstallContext';
import { FiDownload, FiX, FiCheck, FiSmartphone, FiZap, FiShield } from 'react-icons/fi';
import './InstallModal.scss';

const InstallModal = () => {
  const { 
    showInstallModal, 
    isInstallable, 
    isLoading, 
    handleInstallClick, 
    hideModal 
  } = useInstall();

  if (!showInstallModal) {
    return null;
  }

  return (
    <div className="install-modal-overlay" onClick={hideModal}>
      <div className="install-modal" onClick={(e) => e.stopPropagation()}>
        <div className="install-modal-header">
          <h2>Install Nesto</h2>
          <button 
            className="install-modal-close"
            onClick={hideModal}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        <div className="install-modal-content">
          <div className="install-modal-icon">
            <FiDownload />
          </div>

          <div className="install-modal-description">
            <p>Get the best experience by installing Nesto as a native app on your device.</p>
          </div>

          <div className="install-modal-features">
            <div className="feature">
              <FiZap className="feature-icon" />
              <div className="feature-content">
                <h4>Fast & Responsive</h4>
                <p>Lightning-fast performance with native app speed</p>
              </div>
            </div>

            <div className="feature">
              <FiShield className="feature-icon" />
              <div className="feature-content">
                <h4>Secure & Private</h4>
                <p>Your data stays on your device and the Internet Computer</p>
              </div>
            </div>

            <div className="feature">
              <FiSmartphone className="feature-icon" />
              <div className="feature-content">
                <h4>Works Offline</h4>
                <p>Access your data even without an internet connection</p>
              </div>
            </div>
          </div>

          <div className="install-modal-instructions">
            <h4>How to install:</h4>
            <ol>
              <li>Click "Install Nesto" below</li>
              <li>Follow your browser's installation prompt</li>
              <li>Access Nesto from your app drawer or home screen</li>
            </ol>
          </div>

          <div className="install-modal-actions">
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
              <div className="install-fallback">
                <p>Installation not available in this browser</p>
                <p>Try using Chrome, Edge, or Safari for the best experience</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallModal;
