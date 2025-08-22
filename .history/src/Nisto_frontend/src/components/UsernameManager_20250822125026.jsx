import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { handleError, handleSuccess } from '../utils/errorHandler';
import { 
  FiUser, 
  FiEdit2, 
  FiCheck, 
  FiX, 
  FiRefreshCw, 
  FiCopy,
  FiShield,
  FiInfo
} from 'react-icons/fi';
import { 
  formatUsername, 
  getUsernameColor, 
  validateDisplayName 
} from '../utils/usernameUtils';

export default function UsernameManager() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useNotification();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showUsernameInfo, setShowUsernameInfo] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName || '');
  }, [user?.displayName]);

  const handleSave = async () => {
    setError(null);
    const validation = validateDisplayName(displayName);
    
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    
    try {
      setSaving(true);
      await updateProfile(displayName, null);
      setIsEditing(false);
      handleSuccess('username', 'profile', showToast);
    } catch (err) {
      const errorMessage = handleError(err, 'profile', showToast);
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(user?.displayName || '');
    setError(null);
    setIsEditing(false);
  };

  const copyUsername = () => {
    navigator.clipboard.writeText(user?.username || '');
    showToast('Username copied to clipboard', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Username Display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem',
        background: '#f8fafc',
        borderRadius: '0.5rem',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: '#e2e8f0',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b'
          }}>
            <FiUser size={16} />
      </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.125rem' }}>Username</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
              {user?.username || '—'}
          </div>
        </div>
            </div>
            <button 
              onClick={copyUsername}
          style={{
            background: 'none',
            border: '1px solid #d1d5db',
            padding: '0.375rem 0.75rem',
            borderRadius: '0.375rem',
            color: '#64748b',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            transition: 'all 0.2s'
          }}
        >
          <FiCopy size={12} />
          Copy
            </button>
          </div>
          
      {/* Display Name Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem',
        background: '#f8fafc',
        borderRadius: '0.5rem',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: '#e2e8f0',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b'
          }}>
            <FiEdit2 size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.125rem' }}>Display Name</div>
            {isEditing ? (
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  outline: 'none',
                  width: '200px'
                }}
                placeholder="Enter display name"
              />
            ) : (
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                {user?.displayName || 'Not set'}
            </div>
            )}
          </div>
        </div>

        {isEditing ? (
          <div style={{ display: 'flex', gap: '0.375rem' }}>
                <button 
                  onClick={handleSave}
                  disabled={saving}
              style={{
                background: '#10b981',
                border: 'none',
                padding: '0.375rem 0.75rem',
                borderRadius: '0.375rem',
                color: 'white',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '0.75rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                opacity: saving ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              <FiCheck size={12} />
              {saving ? 'Saving...' : 'Save'}
                </button>
                <button 
                  onClick={handleCancel}
              style={{
                background: 'none',
                border: '1px solid #d1d5db',
                padding: '0.375rem 0.75rem',
                borderRadius: '0.375rem',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                transition: 'all 0.2s'
              }}
            >
              <FiX size={12} />
              Cancel
                </button>
              </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              background: 'none',
              border: '1px solid #d1d5db',
              padding: '0.375rem 0.75rem',
              borderRadius: '0.375rem',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              transition: 'all 0.2s'
            }}
          >
            <FiEdit2 size={12} />
            Edit
          </button>
            )}
          </div>
          
      {/* Error Message */}
                {error && (
        <div style={{
          padding: '0.5rem 0.75rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.375rem',
          color: '#991b1b',
          fontSize: '0.75rem'
        }}>
          {error}
              </div>
            )}

      {/* Info Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setShowUsernameInfo(!showUsernameInfo)}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.375rem',
            color: '#64748b',
            cursor: 'pointer',
            borderRadius: '0.25rem',
            transition: 'all 0.2s'
          }}
        >
          <FiInfo size={14} />
        </button>
      </div>

      {/* Info Card */}
      {showUsernameInfo && (
        <div style={{
          padding: '0.75rem',
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '0.5rem',
          fontSize: '0.75rem',
          color: '#0369a1'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <FiShield size={14} style={{ marginTop: '1px' }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>About Username & Display Name</div>
              <div style={{ lineHeight: '1.4' }}>
                Your <strong>username</strong> is automatically generated and unique. 
                Your <strong>display name</strong> is what others see and can be customized.
              </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
