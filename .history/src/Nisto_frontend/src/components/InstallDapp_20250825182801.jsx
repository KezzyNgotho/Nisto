import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const InstallDapp = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, identity } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      showNotification('Nesto has been successfully installed!', 'success');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [showNotification]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      showNotification('Installation prompt not available', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        showNotification('Installation started!', 'success');
      } else {
        showNotification('Installation was declined', 'info');
      }

      // Clear the deferredPrompt
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Installation error:', error);
      showNotification('Installation failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    if (!isAuthenticated) {
      try {
        // This would typically open Internet Identity
        showNotification('Please connect your Internet Identity', 'info');
        // You would integrate with your auth context here
      } catch (error) {
        showNotification('Failed to connect wallet', 'error');
      }
    }
  };

  const handleOpenDapp = () => {
    // Open the dapp in a new window or navigate to dashboard
    window.location.href = '/dashboard';
  };

  if (isInstalled) {
    return (
      <div className="install-dapp installed">
        <div className="install-content">
          <div className="install-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
          <h3>Nesto is Installed!</h3>
          <p>Your dapp is ready to use. Click below to open it.</p>
          <button 
            className="btn btn-primary"
            onClick={handleOpenDapp}
          >
            Open Nesto
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="install-dapp">
      <div className="install-content">
        <div className="install-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
        </div>
        
        <h2>Install Nesto</h2>
        <p>Get the best experience by installing Nesto as a native app on your device.</p>
        
        <div className="install-features">
          <div className="feature">
            <span className="feature-icon">🚀</span>
            <span>Fast & Responsive</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🔒</span>
            <span>Secure & Private</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📱</span>
            <span>Works Offline</span>
          </div>
        </div>

        <div className="install-actions">
          {isInstallable ? (
            <button 
              className="btn btn-primary btn-large"
              onClick={handleInstallClick}
              disabled={isLoading}
            >
              {isLoading ? 'Installing...' : 'Install Nesto'}
            </button>
          ) : (
            <div className="install-fallback">
              <p>Installation not available in this browser</p>
              <button 
                className="btn btn-secondary"
                onClick={handleOpenDapp}
              >
                Open in Browser
              </button>
            </div>
          )}
          
          {!isAuthenticated && (
            <button 
              className="btn btn-outline"
              onClick={handleConnectWallet}
            >
              Connect Internet Identity
            </button>
          )}
        </div>

        <div className="install-instructions">
          <h4>How to install:</h4>
          <ol>
            <li>Click "Install Nesto" above</li>
            <li>Follow your browser's installation prompt</li>
            <li>Access Nesto from your app drawer or home screen</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default InstallDapp;
