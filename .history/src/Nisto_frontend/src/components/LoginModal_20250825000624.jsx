import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  FiX, 
  FiUser, 
  FiLock, 
  FiEye, 
  FiEyeOff,
  FiShield,
  FiCheck,
  FiAlertCircle,
  FiArrowRight,
  FiGlobe,
  FiSmartphone
} from 'react-icons/fi';

const LoginModal = ({ isOpen, onClose }) => {
  const { login, isLoading } = useAuth();
  const { showToast } = useNotification();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setIsAuthenticating(true);
    try {
      await login();
      showToast({ message: 'Successfully authenticated!', type: 'success' });
      onClose();
    } catch (error) {
      console.error('Login error:', error);
      showToast({ 
        message: error.message || 'Authentication failed. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleClose = () => {
    if (!isAuthenticating) {
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        maxWidth: '450px',
        width: '90%',
        position: 'relative',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#1e293b' }}>
              Welcome to Nisto
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>
              Your secure Internet Computer wallet
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isAuthenticating}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: isAuthenticating ? 'not-allowed' : 'pointer',
              color: '#64748b',
              padding: '0.5rem',
              opacity: isAuthenticating ? 0.5 : 1
            }}
          >
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          {/* Simple Login Section */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              margin: '0 auto 1.5rem auto'
            }}>
              <FiShield size={32} />
            </div>
            
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
              Sign In
            </h3>
            <p style={{ margin: '0 0 2rem 0', color: '#64748b', fontSize: '0.875rem' }}>
              Use Internet Identity to securely access your account
            </p>

            <button
              onClick={handleLogin}
              disabled={isAuthenticating || isLoading}
              style={{
                width: '100%',
                padding: '1rem',
                background: isAuthenticating || isLoading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isAuthenticating || isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!isAuthenticating && !isLoading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
            >
              {isAuthenticating || isLoading ? (
                <>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Signing In...
                </>
              ) : (
                <>
                  <FiGlobe size={20} />
                  Continue with Internet Identity
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e5e7eb',
          background: '#f8fafc'
        }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
            By continuing, you agree to our{' '}
            <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>Privacy Policy</a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginModal;
