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

  // Parse metadata to get invitation details
  const metadata = notification.metadata ? JSON.parse(notification.metadata) : {};
  const { vaultId, role, invitedBy, invitationId } = metadata;

  const handleResponse = async (response) => {
    if (!vaultId) {
      showToast({ message: 'Invalid invitation data', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const result = await respondToVaultInvitation(vaultId, response);
      if (result.ok) {
        showToast({ 
          message: response === 'accept' ? 'Invitation accepted! You are now a member.' : 'Invitation declined.',
          type: 'success' 
        });
        // Call the parent callback to update the notification
        if (onResponse) {
          onResponse(notification.id, response);
        }
      } else {
        showToast({ message: result.err || 'Failed to respond to invitation', type: 'error' });
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      showToast({ message: 'Failed to respond to invitation', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '16px',
      backgroundColor: theme.colors.background.secondary,
      borderRadius: '12px',
      border: `1px solid ${theme.colors.border}`,
      marginBottom: '12px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}dd 100%)`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          flexShrink: 0
        }}>
          <SafeIcon iconName="FiUserPlus" size={20} />
        </div>
        
        <div style={{ flex: 1 }}>
          <h4 style={{
            margin: '0 0 4px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: theme.colors.text.primary
          }}>
            {notification.title}
          </h4>
          <p style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            color: theme.colors.text.secondary,
            lineHeight: '1.4'
          }}>
            {notification.message}
          </p>
          <div style={{
            fontSize: '12px',
            color: theme.colors.text.muted,
            display: 'flex',
            gap: '16px'
          }}>
            <span>Role: {role || 'member'}</span>
            <span>Invited by: {invitedBy ? invitedBy.substring(0, 8) + '...' : 'Unknown'}</span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={() => handleResponse('decline')}
          disabled={loading}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: 'transparent',
            color: theme.colors.text.secondary,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = theme.colors.error + '10';
              e.target.style.borderColor = theme.colors.error;
              e.target.style.color = theme.colors.error;
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = theme.colors.border;
              e.target.style.color = theme.colors.text.secondary;
            }
          }}
        >
          {loading ? 'Processing...' : 'Decline'}
        </button>
        
        <button
          onClick={() => handleResponse('accept')}
          disabled={loading}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: theme.colors.success,
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }
          }}
        >
          {loading ? 'Processing...' : 'Accept'}
        </button>
      </div>
    </div>
  );
}
