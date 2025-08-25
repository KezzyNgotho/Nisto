import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FiDownload, FiX, FiSmartphone, FiMonitor } from 'react-icons/fi';

const PWAInstallPrompt = () => {
  const { theme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const colors = {
    primary: theme === 'dark' ? '#10B981' : '#075B5E',
    background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    surface: theme === 'dark' ? '#374151' : '#F9FAFB',
    border: theme === 'dark' ? '#4B5563' : '#E5E7EB',
    text: {
      primary: theme === 'dark' ? '#F9FAFB' : '#1F2937',
      secondary: theme === 'dark' ? '#D1D5DB' : '#6B7280',
      muted: theme === 'dark' ? '#9CA3AF' : '#9CA3AF'
    }
  };

  useEffect(() => {
    // Check if app is already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true;
    
    if (isInstalled) {
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
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show prompt after a delay if no beforeinstallprompt event occurs
    const timer = setTimeout(() => {
      if (!showInstallPrompt && !deferredPrompt) {
        setShowInstallPrompt(true);
      }
    }, 2000); // Show after 2 seconds (reduced from 3)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [showInstallPrompt, deferredPrompt]);

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
        alert('To install Nisto on iOS:\n1. Tap the Share button (square with arrow)\n2. Tap "Add to Home Screen"\n3. Tap "Add"');
      } else if (isAndroid) {
        alert('To install Nisto on Android:\n1. Tap the menu button (three dots)\n2. Tap "Add to Home screen"\n3. Tap "Add"');
      } else {
        alert('To install Nisto on Desktop:\n1. Click the install icon in your browser\'s address bar\n2. Or use Ctrl+Shift+I to open developer tools and look for the install option');
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

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slideUp">
      <div 
        className="rounded-xl shadow-2xl border backdrop-blur-sm"
        style={{ 
          backgroundColor: colors.background,
          borderColor: colors.border,
          boxShadow: `0 10px 25px -5px ${colors.border}40`
        }}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div 
              className="p-2 rounded-lg flex-shrink-0"
              style={{ 
                backgroundColor: colors.primary + '15',
                color: colors.primary
              }}
            >
              <FiDownload className="h-5 w-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold mb-1" style={{ color: colors.text.primary }}>
                Install Nisto
              </h3>
              <p className="text-sm mb-3" style={{ color: colors.text.secondary }}>
                Install Nisto on your device for quick access and a better experience
              </p>
              
              <div className="flex items-center gap-4 text-xs mb-3" style={{ color: colors.text.muted }}>
                <div className="flex items-center gap-1">
                  <FiSmartphone className="h-3 w-3" />
                  <span>Mobile App</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiMonitor className="h-3 w-3" />
                  <span>Desktop App</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
                    color: 'white',
                    boxShadow: `0 2px 8px ${colors.primary}30`
                  }}
                  onMouseEnter={(e) => {
                    if (!isInstalling) {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = `0 4px 12px ${colors.primary}50`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = `0 2px 8px ${colors.primary}30`;
                  }}
                >
                                     {isInstalling ? (
                     <>
                       <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                       Installing...
                     </>
                   ) : (
                     <>
                       <FiDownload className="h-3 w-3" />
                       Install App
                     </>
                   )}
                </button>
                
                <button
                  onClick={handleDismiss}
                  className="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.text.secondary,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <FiX className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
