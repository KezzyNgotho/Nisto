import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { InstallProvider, useInstall } from './contexts/InstallContext';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import PWAServiceWorker from './components/PWAServiceWorker';
import PWAStatus from './components/PWAStatus';
import InstallBanner from './components/InstallBanner';
import InstallModal from './components/InstallModal';

import './App.scss';



// Wrapper component to make notification context available globally
function NotificationContextWrapper({ children }) {
  const notificationContext = useNotification();
  
  useEffect(() => {
    // Make notification context available globally for initialization
    window.notificationContext = notificationContext;
    
    return () => {
      delete window.notificationContext;
    };
  }, [notificationContext]);

  return children;
} 

// Global error handler for BigInt serialization issues
const handleGlobalError = (event) => {
  if (event.error && event.error.message && event.error.message.includes('serialize')) {
    console.warn('Serialization error caught and handled:', event.error);
    event.preventDefault();
    return false;
  }
};

// Global unhandled promise rejection handler
const handleUnhandledRejection = (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('serialize')) {
    console.warn('Unhandled promise rejection (serialization) caught and handled:', event.reason);
    event.preventDefault();
    return false;
  }
};

function App() {
  React.useEffect(() => {
    // Add global error handlers
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Cleanup
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <InstallProvider>
            <AuthProvider>
              <NotificationContextWrapper>
                <Router>
                  <div className="App">
                    <InstallBanner />
                    <Routes>
                      <Route path="/" element={<Landing />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                    </Routes>
                    <PWAServiceWorker />
                    <PWAStatus />
                    <InstallModal />
                  </div>
                </Router>
              </NotificationContextWrapper>
            </AuthProvider>
          </InstallProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App; 