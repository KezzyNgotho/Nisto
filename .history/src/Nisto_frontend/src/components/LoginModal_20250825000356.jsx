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
        <div style={{ padding: '1.5rem' }}>
          {/* Internet Identity Section */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <FiShield size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>
                  Internet Identity
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                  Secure, passwordless authentication
                </p>
              </div>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <FiCheck style={{ color: '#10b981', fontSize: '0.875rem' }} />
                <span style={{ fontSize: '0.875rem', color: '#374151' }}>No passwords required</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <FiCheck style={{ color: '#10b981', fontSize: '0.875rem' }} />
                <span style={{ fontSize: '0.875rem', color: '#374151' }}>Biometric authentication</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiCheck style={{ color: '#10b981', fontSize: '0.875rem' }} />
                <span style={{ fontSize: '0.875rem', color: '#374151' }}>Cross-device sync</span>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={isAuthenticating || isLoading}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: isAuthenticating || isLoading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isAuthenticating || isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              {isAuthenticating || isLoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Authenticating...
                </>
              ) : (
                <>
                  <FiGlobe size={18} />
                  Continue with Internet Identity
                  <FiArrowRight size={18} />
                </>
              )}
            </button>
          </div>

          {/* Alternative Options */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
              <span style={{ fontSize: '0.875rem', color: '#64748b', padding: '0 1rem' }}>
                Or continue with
              </span>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button style={{
                padding: '0.75rem',
                background: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                transition: 'all 0.2s'
              }}>
                <FiSmartphone size={16} />
                Mobile App
              </button>
              <button style={{
                padding: '0.75rem',
                background: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                transition: 'all 0.2s'
              }}>
                <FiGlobe size={16} />
                Browser Extension
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '0.5rem',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <FiAlertCircle style={{ color: '#059669', marginTop: '0.125rem' }} />
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#059669' }}>
                  New to Internet Identity?
                </h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#047857', lineHeight: '1.4' }}>
                  Internet Identity is DFINITY's secure authentication system. You can create an account using your phone number or email address.
                </p>
              </div>
            </div>
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
