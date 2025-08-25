// PWA Configuration Validator
export const validatePWA = () => {
  const results = {
    manifest: false,
    serviceWorker: false,
    https: false,
    installable: false,
    issues: []
  };

  // Check if running on HTTPS
  if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
    results.https = true;
  } else {
    results.issues.push('PWA requires HTTPS (except for localhost)');
  }

  // Check if manifest exists and is valid
  if ('serviceWorker' in navigator) {
    fetch('/manifest.json')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Manifest not found');
      })
      .then(manifest => {
        if (manifest.name && manifest.short_name && manifest.start_url) {
          results.manifest = true;
        } else {
          results.issues.push('Manifest missing required fields (name, short_name, start_url)');
        }
      })
      .catch(error => {
        results.issues.push('Manifest not accessible: ' + error.message);
      });
  }

  // Check if service worker is registered
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      if (registrations.length > 0) {
        results.serviceWorker = true;
      } else {
        results.issues.push('Service worker not registered');
      }
    });
  } else {
    results.issues.push('Service worker not supported in this browser');
  }

  // Check if app is installable
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
    results.installable = true;
  }

  return results;
};

// Log PWA status to console
export const logPWAStatus = () => {
  console.log('🔍 PWA Configuration Check:');
  
  const results = validatePWA();
  
  console.log('✅ HTTPS/SSL:', results.https);
  console.log('✅ Manifest:', results.manifest);
  console.log('✅ Service Worker:', results.serviceWorker);
  console.log('✅ Installable:', results.installable);
  
  if (results.issues.length > 0) {
    console.warn('⚠️ Issues found:');
    results.issues.forEach(issue => console.warn('  -', issue));
  } else {
    console.log('🎉 PWA is properly configured!');
  }
  
  return results;
};

// Check if beforeinstallprompt event is available
export const checkInstallPrompt = () => {
  return new Promise((resolve) => {
    const checkPrompt = () => {
      if (window.deferredPrompt) {
        console.log('✅ Install prompt available');
        resolve(true);
      } else {
        console.log('⏳ Waiting for install prompt...');
        setTimeout(checkPrompt, 1000);
      }
    };
    checkPrompt();
  });
};
