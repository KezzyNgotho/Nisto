import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { useAuth } from './contexts/AuthContext';
import BackendTest from './components/BackendTest.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
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
            <Route path="/test" element={<BackendTest />} />
          </Routes>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
} 