import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import { FiX, FiUser, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';

const LoginModal = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const colors = {
    primary: theme === 'dark' ? '#10B981' : '#075B5E',
    background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    surface: theme === 'dark' ? '#374151' : '#F9FAFB',
    border: theme === 'dark' ? '#4B5563' : '#E5E7EB',
    text: {
      primary: theme === 'dark' ? '#F9FAFB' : '#1F2937',
      secondary: theme === 'dark' ? '#D1D5DB' : '#6B7280',
      muted: theme === 'dark' ? '#9CA3AF' : '#9CA3AF'
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please fill in all fields'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await login(formData.username, formData.password);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Login successful!'
      });
      onClose();
    } catch (error) {
      console.error('Login error:', error);
      showToast({
        type: 'error',
        title: 'Login Failed',
        message: error.message || 'Invalid username or password'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md rounded-2xl shadow-2xl animate-slideUp"
        style={{ 
          backgroundColor: colors.background,
          border: `1px solid ${colors.border}`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ 
                backgroundColor: colors.primary + '15',
                color: colors.primary
              }}
            >
              <FiShield className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: colors.text.primary }}>
              Welcome Back
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-opacity-10"
            style={{ 
              color: colors.text.secondary,
              backgroundColor: colors.text.secondary + '10'
            }}
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Username Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: colors.text.primary }}>
              Username
            </label>
            <div className="relative">
              <div 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: colors.text.muted }}
              >
                <FiUser className="h-4 w-4" />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text.primary,
                  focusRingColor: colors.primary + '30'
                }}
                placeholder="Enter your username"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: colors.text.primary }}>
              Password
            </label>
            <div className="relative">
              <div 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: colors.text.muted }}
              >
                <FiLock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text.primary,
                  focusRingColor: colors.primary + '30'
                }}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors"
                style={{ 
                  color: colors.text.muted,
                  hoverColor: colors.text.secondary
                }}
              >
                {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
              color: 'white',
              boxShadow: `0 4px 12px ${colors.primary}40`
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = `0 6px 16px ${colors.primary}60`;
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = `0 4px 12px ${colors.primary}40`;
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
