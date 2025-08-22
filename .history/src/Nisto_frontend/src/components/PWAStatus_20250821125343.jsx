import React, { useState, useEffect } from 'react';
import { FiDownload, FiCheck, FiX, FiInfo } from 'react-icons/fi';

export default function PWAStatus() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstallation = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      setShowStatus(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    checkInstallation();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleDismiss = () => {
    setShowStatus(false);
  };

  if (!showStatus) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: isInstalled ? '#F0FDF4' : '#FEF3C7',
      border: `1px solid ${isInstalled ? '#BBF7D0' : '#FDE68A'}`,
      color: isInstalled ? '#166534' : '#92400E',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      maxWidth: '300px'
    }}>
      {isInstalled ? (
        <>
          <FiCheck size={16} />
          <span>Nesto is installed!</span>
        </>
      ) : isInstallable ? (
        <>
          <FiDownload size={16} />
          <span>Install Nesto for better experience</span>
          <button
            onClick={handleInstall}
            style={{
              background: '#075B5E',
              color: 'white',
              border: 'none',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            Install
          </button>
        </>
      ) : (
        <>
          <FiInfo size={16} />
          <span>PWA features available</span>
        </>
      )}
      
      <button
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          padding: '0.25rem',
          marginLeft: 'auto',
          opacity: 0.7
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.7'}
      >
        <FiX size={14} />
      </button>
    </div>
  );
}
