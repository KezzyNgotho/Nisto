import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { useAuth } from './contexts/AuthContext';
//import BackendTest from './components/BackendTest.jsx';
import PWAServiceWorker from './components/PWAServiceWorker';
import PWAStatus from './components/PWAStatus';
import ErrorBoundary from './components/ErrorBoundary';

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

export default function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
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