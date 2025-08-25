import React, { useEffect } from 'react';

const PWAServiceWorker = () => {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  // This component doesn't render anything visible
  // It just handles service worker registration
  return null;
};

export default PWAServiceWorker;