import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PWAServiceWorker from './components/PWAServiceWorker';
import PWAStatus from './components/PWAStatus';
import ErrorBoundary from './components/ErrorBoundary';
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

function ProtectedRoute({ children }) {
  const auth = useAuth();
  
  // Handle case where auth context is not yet initialized
  if (!auth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.125rem',
        color: '#6b7280'
      }}>
        Initializing authentication...
      </div>
    );
  }
  
  const { isAuthenticated, isLoading } = auth;
  
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.125rem',
        color: '#6b7280'
      }}>
        Loading...
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

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

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <NotificationContextWrapper>
            <Router>
              <div className="App">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
                <PWAServiceWorker />
                <PWAStatus />
              </div>
            </Router>
          </NotificationContextWrapper>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
} 