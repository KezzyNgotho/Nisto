import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FiUsers, FiCheck, FiX, FiShield } from 'react-icons/fi';

const VaultInvitation = ({ invitation, onResponse }) => {
  const { theme } = useTheme();
  const { respondToVaultInvitation } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleResponse = async (response) => {
    setIsLoading(true);
    try {
      const result = await respondToVaultInvitation(invitation.metadata?.vaultId, response);
      if (result.ok) {
        onResponse(response, invitation);
      } else {
        console.error('Failed to respond to invitation:', result.err);
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const parseMetadata = (metadata) => {
    try {
      return JSON.parse(metadata);
    } catch (error) {
      console.error('Failed to parse metadata:', error);
      return {};
    }
  };

  const metadata = parseMetadata(invitation.metadata || '{}');

  return (
    <div style={{
      backgroundColor: theme.colors.background?.primary || theme.colors.background,
      border: `1px solid ${theme.colors.border.primary}`,
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          backgroundColor: theme.colors.primary,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FiUsers size={20} color={theme.colors.white} />
        </div>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: theme.colors.text.primary
          }}>
            {invitation.title}
          </h3>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '14px',
            color: theme.colors.text.secondary
          }}>
            {invitation.message}
          </p>
        </div>
      </div>

      {/* Vault Details */}
      {metadata.vaultId && (
        <div style={{
          backgroundColor: theme.colors.background?.secondary || theme.colors.background,
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          border: `1px solid ${theme.colors.border.primary}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <FiShield size={16} color={theme.colors.primary} />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: theme.colors.text.primary
            }}>
              Vault ID: {metadata.vaultId}
            </span>
          </div>
          {metadata.role && (
            <div style={{
              fontSize: '13px',
              color: theme.colors.text.secondary
            }}>
              Role: <span style={{ fontWeight: '500', color: theme.colors.primary }}>{metadata.role}</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={() => handleResponse('decline')}
          disabled={isLoading}
          style={{
            backgroundColor: 'transparent',
            color: theme.colors.error,
            border: `1px solid ${theme.colors.error}`,
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: isLoading ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          <FiX size={16} />
          Decline
        </button>
        
        <button
          onClick={() => handleResponse('accept')}
          disabled={isLoading}
          style={{
            backgroundColor: theme.colors.success,
            color: theme.colors.white,
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: isLoading ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          <FiCheck size={16} />
          Accept
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: `2px solid ${theme.colors.border.primary}`,
            borderTop: `2px solid ${theme.colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
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
};

export default VaultInvitation;
