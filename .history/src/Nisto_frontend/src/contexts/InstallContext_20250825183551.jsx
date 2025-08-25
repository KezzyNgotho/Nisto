import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';

const InstallContext = createContext();

export const useInstall = () => {
  const context = useContext(InstallContext);
  if (!context) {
    throw new Error('useInstall must be used within an InstallProvider');
  }
  return context;
};

export const InstallProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Show banner after a delay
      setTimeout(() => {
        setShowInstallBanner(true);
      }, 3000);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      setShowInstallModal(false);
      showNotification('Nesto has been successfully installed!', 'success');
    };

    // Check if user has dismissed the banner before
    const hasDismissedBanner = localStorage.getItem('nesto-install-banner-dismissed');
    if (!hasDismissedBanner && isInstallable) {
      setShowInstallBanner(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstallable, showNotification]);

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
      setShowInstallBanner(false);
      setShowInstallModal(false);
    } catch (error) {
      console.error('Installation error:', error);
      showNotification('Installation failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('nesto-install-banner-dismissed', 'true');
  };

  const showModal = () => {
    setShowInstallModal(true);
    setShowInstallBanner(false);
  };

  const hideModal = () => {
    setShowInstallModal(false);
  };

  const resetBannerDismissal = () => {
    localStorage.removeItem('nesto-install-banner-dismissed');
  };

  const value = {
    isInstallable,
    isInstalled,
    showInstallBanner,
    showInstallModal,
    isLoading,
    handleInstallClick,
    dismissBanner,
    showModal,
    hideModal,
    resetBannerDismissal
  };

  return (
    <InstallContext.Provider value={value}>
      {children}
    </InstallContext.Provider>
  );
};
