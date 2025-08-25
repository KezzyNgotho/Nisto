import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  FiUsers, 
  FiCheck, 
  FiX, 
  FiClock, 
  FiShield,
  FiUserPlus,
  FiMail,
  FiRefreshCw
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export default function VaultInvitations() {
  const { theme } = useTheme();
  const { respondToVaultInvitation, getUserNotifications, markNotificationAsRead } = useAuth();
  const { showToast } = useNotification();
  
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  const colors = {
    primary: theme === 'dark' ? '#10B981' : '#075B5E',
    secondary: theme === 'dark' ? '#6B7280' : '#6B7280',
    background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    surface: theme === 'dark' ? '#374151' : '#F9FAFB',
    border: theme === 'dark' ? '#4B5563' : '#E5E7EB',
    text: {
      primary: theme === 'dark' ? '#F9FAFB' : '#1F2937',
      secondary: theme === 'dark' ? '#D1D5DB' : '#6B7280',
      muted: theme === 'dark' ? '#9CA3AF' : '#9CA3AF'
    },
    status: {
      success: theme === 'dark' ? '#10B981' : '#10B981',
      warning: theme === 'dark' ? '#F59E0B' : '#F59E0B',
      error: theme === 'dark' ? '#EF4444' : '#EF4444',
      info: theme === 'dark' ? '#3B82F6' : '#3B82F6'
    }
  };

  // Load vault invitations from notifications
  const loadInvitations = async () => {
    try {
      setLoading(true);
      // Get all notifications and filter for vault invitations
      const allNotifications = await getUserNotifications(100, 0);
      const vaultInvitations = allNotifications.filter(notification => 
        notification.title === 'Vault Invitation' || 
        notification.message?.includes('invited to join vault')
      );
      
      // Parse metadata for each invitation
      const parsedInvitations = vaultInvitations.map(notification => {
        let metadata = {};
        try {
          if (notification.metadata) {
            metadata = JSON.parse(notification.metadata);
          }
        } catch (e) {
          console.error('Failed to parse notification metadata:', e);
        }
        
        return {
          id: notification.id,
          vaultId: metadata.vaultId || notification.vaultId,
          vaultName: metadata.vaultName || extractVaultName(notification.message),
          role: metadata.role || 'member',
          invitedBy: metadata.invitedBy || 'Unknown',
          invitationId: metadata.invitationId || notification.id,
          createdAt: notification.createdAt,
          message: notification.message,
          notification: notification
        };
      });
      
             setInvitations(parsedInvitations);
       console.log('Loaded vault invitations:', parsedInvitations);
       console.log('Sample invitation createdAt:', parsedInvitations[0]?.createdAt, typeof parsedInvitations[0]?.createdAt);
    } catch (error) {
      console.error('Failed to load vault invitations:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load vault invitations'
      });
    } finally {
      setLoading(false);
    }
  };

  // Extract vault name from notification message
  const extractVaultName = (message) => {
    if (!message) return 'Unknown Vault';
    const match = message.match(/vault:\s*([^.]+)/i);
    return match ? match[1].trim() : 'Unknown Vault';
  };

  // Safely format date
  const formatDate = (dateValue) => {
    try {
      if (!dateValue) return 'Unknown time';
      
      // Handle different date formats
      let date;
      if (typeof dateValue === 'number') {
        date = new Date(dateValue);
      } else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      } else {
        date = new Date(dateValue);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Unknown time';
      }
      
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error, dateValue);
      return 'Unknown time';
    }
  };

  // Handle accept/decline invitation
  const handleInvitationResponse = async (invitation, response) => {
    if (!invitation.vaultId) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Invalid invitation data'
      });
      return;
    }

    setProcessing(prev => ({ ...prev, [invitation.id]: true }));
    
    try {
      // Convert boolean to string for backend
      const responseText = response ? "accept" : "decline";
      await respondToVaultInvitation(invitation.vaultId, responseText);
      
      // Mark the notification as read
      try {
        await markNotificationAsRead(invitation.id);
      } catch (readError) {
        console.warn('Failed to mark notification as read:', readError);
      }
      
      // Remove the invitation from the list
      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
      
      showToast({
        type: 'success',
        title: response ? 'Invitation Accepted' : 'Invitation Declined',
        message: response 
          ? `You have joined ${invitation.vaultName}. The vault will appear in your vaults list.` 
          : `You have declined the invitation to ${invitation.vaultName}`
      });
      
      // Trigger a vault list refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent('vaults-refresh-needed'));
      
      // Also trigger an invitations count refresh
      window.dispatchEvent(new CustomEvent('invitations-count-refresh'));
      
    } catch (error) {
      console.error('Failed to respond to invitation:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: `Failed to ${response ? 'accept' : 'decline'} invitation`
      });
    } finally {
      setProcessing(prev => ({ ...prev, [invitation.id]: false }));
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }}></div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center p-8">
        <FiMail className="mx-auto h-12 w-12 mb-4" style={{ color: colors.text.muted }} />
        <h3 className="text-lg font-medium mb-2" style={{ color: colors.text.primary }}>
          No Pending Invitations
        </h3>
        <p className="text-sm" style={{ color: colors.text.secondary }}>
          You don't have any vault invitations at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
          Vault Invitations ({invitations.length})
        </h3>
        <button
          onClick={loadInvitations}
          className="flex items-center gap-2 px-3 py-1 text-sm rounded-md transition-colors"
          style={{ 
            backgroundColor: colors.surface,
            color: colors.text.secondary,
            border: `1px solid ${colors.border}`
          }}
        >
          <FiRefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>
      
      <div className="space-y-3">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="p-4 rounded-lg border transition-all hover:shadow-md"
            style={{ 
              backgroundColor: colors.surface,
              borderColor: colors.border
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FiUserPlus className="h-5 w-5" style={{ color: colors.primary }} />
                  <h4 className="font-medium" style={{ color: colors.text.primary }}>
                    {invitation.vaultName}
                  </h4>
                  <span 
                    className="px-2 py-1 text-xs rounded-full"
                    style={{ 
                      backgroundColor: colors.status.info + '20',
                      color: colors.status.info
                    }}
                  >
                    {invitation.role}
                  </span>
                </div>
                
                <p className="text-sm mb-2" style={{ color: colors.text.secondary }}>
                  Invited by <span className="font-medium">{invitation.invitedBy}</span>
                </p>
                
                <div className="flex items-center gap-4 text-xs" style={{ color: colors.text.muted }}>
                  <div className="flex items-center gap-1">
                    <FiClock className="h-3 w-3" />
                    {formatDate(invitation.createdAt)}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleInvitationResponse(invitation, true)}
                  disabled={processing[invitation.id]}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                  style={{ 
                    backgroundColor: colors.status.success,
                    color: 'white'
                  }}
                >
                  {processing[invitation.id] ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <FiCheck className="h-3 w-3" />
                  )}
                  Accept
                </button>
                
                <button
                  onClick={() => handleInvitationResponse(invitation, false)}
                  disabled={processing[invitation.id]}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                  style={{ 
                    backgroundColor: colors.status.error,
                    color: 'white'
                  }}
                >
                  {processing[invitation.id] ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <FiX className="h-3 w-3" />
                  )}
                  Decline
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
