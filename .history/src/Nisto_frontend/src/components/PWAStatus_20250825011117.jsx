import React, { useEffect, useState } from 'react';

const PWAStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swStatus, setSwStatus] = useState('checking');

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) 
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          setSwStatus('registered');
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
          setSwStatus('failed');
        });
    } else {
      setSwStatus('not-supported');
    }

    // Online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // This component doesn't render anything visible
  // It just handles service worker registration and status monitoring
  return null;
};

export default PWAStatus;
