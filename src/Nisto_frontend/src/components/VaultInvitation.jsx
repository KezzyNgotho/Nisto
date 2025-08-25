import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import SafeIcon from './SafeIcon';

export default function VaultInvitation({ notification, onResponse }) {
  const { theme } = useTheme();
  const { respondToVaultInvitation } = useAuth();
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState(null); // 'accept' or 'decline'

  // Parse metadata to get invitation details
  const metadata = notification.metadata ? JSON.parse(notification.metadata) : {};
  const { vaultId, role, invitedBy, invitationId } = metadata;

  const handleResponse = async (response) => {
    if (!vaultId) {
      showToast({ message: 'Invalid invitation data', type: 'error' });
      return;
    }

    setLoading(true);
    setAction(response);
    
    try {
      console.log('Responding to vault invitation:', { vaultId, response });
      const result = await respondToVaultInvitation(vaultId, response);
      
      if (result && result.ok) {
        const message = response === 'accept' 
          ? '🎉 Invitation accepted! You are now a member of the vault.' 
          : 'Invitation declined.';
        
        showToast({ 
          message,
          type: 'success',
          duration: 5000
        });
        
        // Call the parent callback to update the notification
        if (onResponse) {
          onResponse(notification.id, response);
        }
      } else {
        const errorMessage = result?.err || 'Failed to respond to invitation';
        showToast({ 
          message: errorMessage, 
          type: 'error',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      showToast({ 
        message: 'Failed to respond to invitation. Please try again.', 
        type: 'error',
        duration: 5000
      });
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  const getStatusColor = () => {
    if (loading) return theme.colors.primary;
    if (action === 'accept') return theme.colors.success;
    if (action === 'decline') return theme.colors.error;
    return theme.colors.primary;
  };

  const getStatusText = () => {
    if (loading) return 'Processing...';
    if (action === 'accept') return 'Accepted!';
    if (action === 'decline') return 'Declined';
    return 'Vault Invitation';
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: theme.colors.background.secondary,
      borderRadius: '16px',
      border: `2px solid ${getStatusColor()}`,
      marginBottom: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Status indicator */}
      {action && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: getStatusColor(),
          transition: 'all 0.3s ease'
        }} />
      )}

      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: `linear-gradient(135deg, ${getStatusColor()} 0%, ${getStatusColor()}dd 100%)`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          flexShrink: 0,
          boxShadow: `0 4px 12px ${getStatusColor()}40`
        }}>
          <SafeIcon iconName="FiUserPlus" size={24} />
        </div>
        
        <div style={{ flex: 1 }}>
          <h4 style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: '700',
            color: theme.colors.text.primary
          }}>
            {getStatusText()}
          </h4>
          <p style={{
            margin: '0 0 12px 0',
            fontSize: '15px',
            color: theme.colors.text.secondary,
            lineHeight: '1.5'
          }}>
            {notification.message}
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '13px',
            color: theme.colors.text.muted
          }}>
            <span style={{
              padding: '4px 8px',
              backgroundColor: `${theme.colors.primary}15`,
              color: theme.colors.primary,
              borderRadius: '6px',
              fontWeight: '500'
            }}>
              Role: {role || 'member'}
            </span>
            <span style={{
              padding: '4px 8px',
              backgroundColor: `${theme.colors.border}20`,
              borderRadius: '6px'
            }}>
              Invited by: {invitedBy ? invitedBy.substring(0, 8) + '...' : 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {!action && (
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => handleResponse('decline')}
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: `2px solid ${theme.colors.error}`,
              backgroundColor: 'transparent',
              color: theme.colors.error,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.3s ease',
              minWidth: '100px'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = `${theme.colors.error}15`;
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 6px 20px ${theme.colors.error}30`;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: `2px solid ${theme.colors.error}`,
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Processing...
              </div>
            ) : (
              'Decline'
            )}
          </button>
          
          <button
            onClick={() => handleResponse('accept')}
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: theme.colors.success,
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.3s ease',
              minWidth: '100px',
              boxShadow: `0 4px 12px ${theme.colors.success}40`
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 8px 25px ${theme.colors.success}50`;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = `0 4px 12px ${theme.colors.success}40`;
              }
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Processing...
              </div>
            ) : (
              'Accept'
            )}
          </button>
        </div>
      )}

      {action && (
        <div style={{
          textAlign: 'center',
          padding: '16px',
          backgroundColor: `${getStatusColor()}10`,
          borderRadius: '10px',
          marginTop: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: getStatusColor(),
            fontWeight: '600',
            fontSize: '16px'
          }}>
            <SafeIcon 
              iconName={action === 'accept' ? 'FiCheckCircle' : 'FiXCircle'} 
              size={20} 
            />
            {action === 'accept' ? 'Invitation Accepted!' : 'Invitation Declined'}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
