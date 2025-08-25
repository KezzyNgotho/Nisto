# Nisto PWA (Progressive Web App) Setup

## Overview
Nisto is configured as a Progressive Web App (PWA) that can be installed on desktop and mobile devices, providing a native app-like experience.

## Features
- ✅ **Installable**: Can be installed on desktop and mobile devices
- ✅ **Offline Support**: Works offline with cached resources
- ✅ **Push Notifications**: Supports push notifications
- ✅ **App-like Experience**: Full-screen, standalone mode
- ✅ **Fast Loading**: Optimized caching and performance

## Installation

### Desktop (Chrome, Edge, Firefox)
1. Visit the Nisto app in your browser
2. Look for the install icon (⬇️) in the address bar
3. Click "Install" to add to your desktop
4. The app will appear in your applications list

### Mobile (Android)
1. Open Chrome browser on your Android device
2. Navigate to the Nisto app
3. Tap the menu (⋮) in the top right
4. Tap "Add to Home screen"
5. Tap "Add" to confirm

### Mobile (iOS)
1. Open Safari browser on your iOS device
2. Navigate to the Nisto app
3. Tap the share button (□↑)
4. Tap "Add to Home Screen"
5. Tap "Add" to confirm

## PWA Components

### 1. Manifest (`public/manifest.json`)
- Defines app metadata, icons, and installation behavior
- Configures display mode, theme colors, and shortcuts

### 2. Service Worker (`public/sw.js`)
- Handles caching and offline functionality
- Manages push notifications and background sync
- Provides app-like performance

### 3. Install Prompt (`src/components/PWAInstallPrompt.jsx`)
- Shows installation prompt to users
- Handles different installation methods
- Provides manual installation instructions

### 4. PWA Status (`src/components/PWAStatus.jsx`)
- Shows installation status
- Provides quick install button
- Displays PWA features availability

### 5. Service Worker Registration (`src/components/PWAServiceWorker.jsx`)
- Registers the service worker
- Handles installation events
- Manages PWA lifecycle

## Icons
- **SVG Icons**: Modern, scalable icons in `/public/icons/`
- **Sizes**: 192x192 and 512x512 for optimal display
- **Purposes**: `maskable any` for adaptive icons

## Caching Strategy
- **Static Cache**: Core app files (HTML, CSS, JS, icons)
- **Dynamic Cache**: API responses and dynamic content
- **Network First**: For API calls with cache fallback
- **Cache First**: For static assets

## Testing PWA Installation

### Chrome DevTools
1. Open Chrome DevTools (F12)
2. Go to Application tab
3. Check "Manifest" section for PWA requirements
4. Check "Service Workers" for registration status
5. Use "Lighthouse" to audit PWA score

### Manual Testing
1. Visit the app in Chrome
2. Look for install prompt or address bar icon
3. Test offline functionality
4. Verify app appears in applications list

## Troubleshooting

### Installation Not Available
- Ensure HTTPS is enabled (required for PWA)
- Check that manifest.json is accessible
- Verify service worker is registered
- Clear browser cache and try again

### Icons Not Displaying
- Check icon file paths in manifest.json
- Ensure icons are in correct format (SVG/PNG)
- Verify icon sizes match manifest specifications

### Offline Not Working
- Check service worker registration
- Verify cache strategy implementation
- Clear browser cache and reload

## Browser Support
- ✅ Chrome 67+
- ✅ Edge 79+
- ✅ Firefox 67+
- ✅ Safari 11.1+ (iOS 11.3+)
- ✅ Samsung Internet 7.2+

## Performance Optimization
- Service worker caching for fast loading
- Optimized icon sizes and formats
- Minimal manifest file size
- Efficient cache strategies

## Security Considerations
- HTTPS required for PWA features
- Secure service worker implementation
- Proper cache invalidation
- Safe push notification handling

## Future Enhancements
- [ ] Background sync for offline actions
- [ ] Advanced push notification features
- [ ] App shortcuts for quick actions
- [ ] Enhanced offline experience
- [ ] Cross-platform sync
