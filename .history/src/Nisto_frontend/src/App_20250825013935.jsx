import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PWAServiceWorker from './components/PWAServiceWorker';
import PWAStatus from './components/PWAStatus';
import 
import './App.scss';

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
                  <PWAServiceWorker />
                  <PWAStatus />
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