import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import PWAInstallGuide from './components/PWAInstallGuide';
import './App.scss';

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
          <NotificationContextWrapper>
            <AuthProvider>
              <Router>
                <div className="App">
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                  </Routes>
                  <PWAInstallPrompt />
                  <PWAInstallGuide />
                </div>  
              </Router>
            </AuthProvider>
          </NotificationContextWrapper>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App; 