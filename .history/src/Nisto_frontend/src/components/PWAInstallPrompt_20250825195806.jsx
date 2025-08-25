import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FiDownload, FiX, FiSmartphone, FiMonitor, FiCheck } from 'react-icons/fi';

const PWAInstallPrompt = () => {
  const { theme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const colors = {
    primary: theme?.colors?.primary || '#113F67',
    background: theme?.colors?.background?.primary || '#FFFFFF',
    surface: theme?.colors?.surface || '#F9FAFB',
    border: theme?.colors?.border?.primary || '#E5E7EB',
    text: {
      primary: theme?.colors?.text?.primary || '#1F2937',
      secondary: theme?.colors?.text?.secondary || '#6B7280',
      muted: theme?.colors?.text?.muted || '#9CA3AF'
    }
  };

  useEffect(() => {
    // Check if app is already installed
    const checkInstallation = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          window.navigator.standalone === true;
      setIsInstalled(isStandalone);
      return isStandalone;
    };
    
    if (checkInstallation()) {
      return;
    }

    // Check if user has previously dismissed the prompt
    const hasUserDismissed = localStorage.getItem('pwa-install-dismissed');
    if (hasUserDismissed) {
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
      console.log('Nesto PWA installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show prompt after a delay if no beforeinstallprompt event occurs
    const timer = setTimeout(() => {
      if (!showInstallPrompt && !deferredPrompt && !isInstalled) {
        setShowInstallPrompt(true);
      }
    }, 5000); // Show after 5 seconds

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [showInstallPrompt, deferredPrompt, isInstalled]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      setIsInstalling(true);
      
      try {
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
      } catch (error) {
        console.error('Error during install:', error);
      } finally {
        setIsInstalling(false);
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    } else {
      // Manual install instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        alert('To install Nisto on iOS:\n\n1. Tap the Share button (square with arrow)\n2. Tap "Add to Home Screen"\n3. Tap "Add"\n\nThis will give you quick access to Nisto from your home screen!');
      } else if (isAndroid) {
        alert('To install Nisto on Android:\n\n1. Tap the menu button (three dots)\n2. Tap "Add to Home screen"\n3. Tap "Add"\n\nThis will give you quick access to Nisto from your home screen!');
      } else {
        alert('To install Nisto on Desktop:\n\n1. Click the install icon (⬇️) in your browser\'s address bar\n2. Or use Ctrl+Shift+I to open developer tools and look for the install option\n\nThis will give you quick access to Nisto from your desktop!');
      }
      
      setShowInstallPrompt(false);
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
    // Remember that user dismissed the prompt
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showInstallPrompt || isInstalled) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      right: '20px',
      maxWidth: '400px',
      margin: '0 auto',
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
      color: 'white',
      padding: '1.5rem',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      zIndex: 10000,
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '12px',
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FiDownload size={24} />
        </div>
        
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '1.125rem', 
            fontWeight: 600,
            lineHeight: 1.3
          }}>
            Install Nisto
          </h4>
          <p style={{ 
            margin: '0 0 1rem 0', 
            fontSize: '0.875rem', 
            opacity: 0.9,
            lineHeight: 1.4
          }}>
            Get the full app experience with offline access, quick launch, and native performance
          </p>
          
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: isInstalling ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                opacity: isInstalling ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isInstalling) {
                  e.target.style.background = 'rgba(255,255,255,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
              }}
            >
              {isInstalling ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Installing...
                </>
              ) : (
                <>
                  <FiDownload size={16} />
                  Install Now
                </>
              )}
            </button>
            
            <button
              onClick={handleDismiss}
              style={{
                background: 'transparent',
                color: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.1)';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'rgba(255,255,255,0.8)';
              }}
            >
              Maybe Later
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'rgba(255,255,255,0.8)',
            borderRadius: '8px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.2)';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.1)';
            e.target.style.color = 'rgba(255,255,255,0.8)';
          }}
        >
          <FiX size={16} />
        </button>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PWAInstallPrompt;
