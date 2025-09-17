import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  FiX, 
  FiShield,
  FiGlobe,
  FiZap,
  FiCheckCircle,
  FiLock
} from 'react-icons/fi';

const LoginModal = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
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
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease-out',
      padding: '1rem'
    }}>
      <div style={{
        background: theme.colors.background.primary,
        borderRadius: '1.5rem',
        maxWidth: '480px',
        width: '100%',
        position: 'relative',
        animation: 'slideUp 0.4s ease-out',
        border: `1px solid ${theme.colors.border.primary}`,
        boxShadow: `0 25px 50px ${theme.colors.shadow.dark}`,
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '2rem 2rem 1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${theme.colors.primary}10, ${theme.colors.secondary}10)`
        }}>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: '1.75rem', 
              fontWeight: '700', 
              color: theme.colors.text.primary,
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              // Fallback for browsers that don't support gradient text
              WebkitTextStroke: `1px ${theme.colors.text.primary}20`
            }}>
              Welcome to Nisto
            </h2>
            <p style={{ 
              margin: '0.5rem 0 0 0', 
              fontSize: '0.875rem', 
              color: theme.colors.text.second 
            }}>
              Secure, decentralized finance
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isAuthenticating}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: isAuthenticating ? 'not-allowed' : 'pointer',
              color: theme.colors.text.secondary,
              padding: '0.75rem',
              borderRadius: '0.75rem',
              opacity: isAuthenticating ? 0.5 : 1,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (!isAuthenticating) {
                e.target.style.background = theme.colors.background.secondary;
                e.target.style.color = theme.colors.text.primary;
                e.target.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = theme.colors.text.secondary;
              e.target.style.transform = 'scale(1)';
            }}
          >
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          {/* Hero Section */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              borderRadius: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.colors.white,
              margin: '0 auto 1.5rem auto',
              boxShadow: `0 8px 24px ${theme.colors.primary}30`
            }}>
              <FiShield size={36} />
            </div>
            
            <h3 style={{ 
              margin: '0 0 0.75rem 0', 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: theme.colors.text.primary 
            }}>
              Sign In Securely
            </h3>
            <p style={{ 
              margin: '0 0 2rem 0', 
              color: theme.colors.text.secondary, 
              fontSize: '1rem',
              lineHeight: '1.6'
            }}>
              Use Internet Identity for secure, decentralized authentication
            </p>
          </div>

          {/* Features */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {[
              { icon: <FiLock />, text: 'Secure' },
              { icon: <FiZap />, text: 'Fast' },
              { icon: <FiCheckCircle />, text: 'Reliable' }
            ].map((feature, index) => (
              <div key={index} style={{
                textAlign: 'center',
                padding: '1rem',
                background: theme.colors.background.secondary,
                borderRadius: '0.75rem',
                border: `1px solid ${theme.colors.border.primary}`
              }}>
                <div style={{
                  color: theme.colors.primary,
                  fontSize: '1.25rem',
                  marginBottom: '0.5rem'
                }}>
                  {feature.icon}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: theme.colors.text.secondary
                }}>
                  {feature.text}
                </div>
              </div>
            ))}
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isAuthenticating || isLoading}
            style={{
              width: '100%',
              padding: '1.25rem',
              background: isAuthenticating || isLoading 
                ? theme.colors.text.muted 
                : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              color: theme.colors.white,
              border: 'none',
              borderRadius: '1rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              cursor: isAuthenticating || isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              transition: 'all 0.3s ease',
              boxShadow: isAuthenticating || isLoading 
                ? 'none' 
                : `0 8px 24px ${theme.colors.primary}30`,
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!isAuthenticating && !isLoading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 12px 32px ${theme.colors.primary}40`;
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = `0 8px 24px ${theme.colors.primary}30`;
            }}
          >
            {isAuthenticating || isLoading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Signing In...
              </>
            ) : (
              <>
                <FiGlobe size={22} />
                Continue with Internet Identity
              </>
            )}
          </button>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            padding: '1rem',
            background: theme.colors.background.secondary,
            borderRadius: '0.75rem',
            border: `1px solid ${theme.colors.border.primary}`
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.75rem',
              color: theme.colors.text.secondary,
              lineHeight: '1.5'
            }}>
              By signing in, you agree to our Terms of Service and Privacy Policy.
              <br />
              Your data is secured with blockchain technology.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to { 
            opacity: 1;
            backdrop-filter: blur(8px);
          }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(40px) scale(0.9);
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default LoginModal;
