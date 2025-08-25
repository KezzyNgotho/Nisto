import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FiUserPlus, FiUsers, FiShield } from 'react-icons/fi';

const VaultInvitationTest = () => {
  const { theme } = useTheme();
  const { inviteVaultMember, createNotification } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    vaultId: '',
    userId: '',
    role: 'member'
  });

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Invite the user to the vault (this will create notifications automatically)
      const result = await inviteVaultMember(formData.vaultId, formData.userId, formData.role);
      
      if (result.ok) {
        console.log('Vault invitation sent successfully:', result.ok);
        
        // Create an additional test notification to demonstrate the system
        await createNotification(
          'Vault', // notificationType
          'Vault Invitation Sent', // title
          `Successfully invited user ${formData.userId} to vault ${formData.vaultId} as ${formData.role}`, // message
          'medium', // priority
          `/vaults/${formData.vaultId}`, // actionUrl
          null // expiresAt
        );
        
        // Reset form
        setFormData({
          vaultId: '',
          userId: '',
          role: 'member'
        });
        
        alert('Vault invitation sent successfully! Check the notification center.');
      } else {
        console.error('Failed to invite user:', result.err);
        alert(`Failed to invite user: ${result.err}`);
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div style={{
      backgroundColor: theme.colors.background?.primary || theme.colors.background,
      border: `1px solid ${theme.colors.border.primary}`,
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '500px',
      margin: '20px auto',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          backgroundColor: theme.colors.primary,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FiUserPlus size={24} color={theme.colors.white} />
        </div>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: theme.colors.text.primary
          }}>
            Test Vault Invitation
          </h2>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '14px',
            color: theme.colors.text.secondary
          }}>
            Send a vault invitation and test the notification system
          </p>
        </div>
      </div>

      <form onSubmit={handleInvite} style={{ display: 'grid', gap: '16px' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: theme.colors.text.primary,
            marginBottom: '8px'
          }}>
            Vault ID
          </label>
          <input
            type="text"
            name="vaultId"
            value={formData.vaultId}
            onChange={handleInputChange}
            placeholder="Enter vault ID"
            required
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: theme.colors.background?.primary || theme.colors.background,
              color: theme.colors.text.primary
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: theme.colors.text.primary,
            marginBottom: '8px'
          }}>
            User ID (Principal)
          </label>
          <input
            type="text"
            name="userId"
            value={formData.userId}
            onChange={handleInputChange}
            placeholder="Enter user principal ID"
            required
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: theme.colors.background?.primary || theme.colors.background,
              color: theme.colors.text.primary
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: theme.colors.text.primary,
            marginBottom: '8px'
          }}>
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: theme.colors.background?.primary || theme.colors.background,
              color: theme.colors.text.primary
            }}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            backgroundColor: theme.colors.primary,
            color: theme.colors.white,
            border: 'none',
            borderRadius: '8px',
            padding: '14px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <FiUsers size={18} />
          {isLoading ? 'Sending Invitation...' : 'Send Vault Invitation'}
        </button>
      </form>

      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: theme.colors.background?.secondary || theme.colors.background,
        borderRadius: '8px',
        border: `1px solid ${theme.colors.border.primary}`
      }}>
        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: theme.colors.text.primary,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FiShield size={16} />
          How it works:
        </h3>
        <ul style={{
          margin: 0,
          paddingLeft: '20px',
          fontSize: '14px',
          color: theme.colors.text.secondary,
          lineHeight: '1.5'
        }}>
          <li>When you send an invitation, the invited user receives a notification</li>
          <li>The notification appears in their notification center</li>
          <li>They can accept or decline the invitation directly from the notification</li>
          <li>Both parties receive confirmation notifications</li>
          <li>Check the notification center to see the results</li>
        </ul>
      </div>
    </div>
  );
};

export default VaultInvitationTest;
