import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
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
      await updateProfile(trimmed, null);
      setIsEditing(false);
      showToast('Display name updated successfully', 'success');
    } catch (err) {
      setError(err?.message || 'Failed to update display name');
      showToast('Failed to update display name', 'error');
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
    <div className="username-manager">
      <div className="username-header">
        <h3>Username Management</h3>
        <button 
          className="btn btn-text" 
          onClick={() => setShowUsernameInfo(!showUsernameInfo)}
          title="Username Information"
        >
          <FiInfo />
        </button>
      </div>

      {showUsernameInfo && (
        <div className="username-info-card">
          <div className="info-icon">
            <FiShield />
          </div>
          <div className="info-content">
            <h4>About Your Username</h4>
            <p>
              Your <strong>username</strong> is automatically generated and unique. 
              It's used for system identification and cannot be changed.
            </p>
            <p>
              Your <strong>display name</strong> is what others see and can be customized 
              to your preference.
            </p>
          </div>
        </div>
      )}

      <div className="username-cards">
        {/* Username Card (Read-only) */}
        <div className="username-card username-card-system">
          <div className="card-header">
            <div className="card-icon" style={{ background: getUsernameColor(user?.username) }}>
              <FiUser />
            </div>
            <div className="card-title">
              <h4>System Username</h4>
              <span className="card-subtitle">Unique identifier (cannot be changed)</span>
            </div>
            <button 
              className="btn btn-text" 
              onClick={copyUsername}
              title="Copy username"
            >
              <FiCopy />
            </button>
          </div>
          
          <div className="card-content">
            <div className="username-display">
              <span className="username-text">{user?.username || '—'}</span>
              <span className="username-formatted">
                {formatUsername(user?.username)}
              </span>
            </div>
          </div>
        </div>

        {/* Display Name Card (Editable) */}
        <div className="username-card username-card-display">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#10B981' }}>
              <FiUser />
            </div>
            <div className="card-title">
              <h4>Display Name</h4>
              <span className="card-subtitle">What others see (can be customized)</span>
            </div>
            {!isEditing ? (
              <button 
                className="btn btn-text" 
                onClick={() => setIsEditing(true)}
                title="Edit display name"
              >
                <FiEdit2 />
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="btn btn-text btn-success" 
                  onClick={handleSave}
                  disabled={saving}
                  title="Save changes"
                >
                  {saving ? <FiRefreshCw className="spin" /> : <FiCheck />}
                </button>
                <button 
                  className="btn btn-text btn-danger" 
                  onClick={handleCancel}
                  disabled={saving}
                  title="Cancel"
                >
                  <FiX />
                </button>
              </div>
            )}
          </div>
          
          <div className="card-content">
            {isEditing ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  className="display-name-input"
                  disabled={saving}
                />
                {error && (
                  <div className="error-message">{error}</div>
                )}
              </div>
            ) : (
              <div className="display-name-display">
                <span className="display-name-text">
                  {user?.displayName || 'No display name set'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .username-manager {
          padding: 20px;
          max-width: 800px;
        }

        .username-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .username-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .username-info-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .info-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .info-content h4 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 1rem;
          font-weight: 600;
        }

        .info-content p {
          margin: 0 0 8px 0;
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .info-content p:last-child {
          margin-bottom: 0;
        }

        .username-cards {
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr;
        }

        @media (min-width: 768px) {
          .username-cards {
            grid-template-columns: 1fr 1fr;
          }
        }

        .username-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          overflow: hidden;
        }

        .username-card-system {
          border-left: 4px solid #3b82f6;
        }

        .username-card-display {
          border-left: 4px solid #10b981;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .card-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .card-title {
          flex: 1;
        }

        .card-title h4 {
          margin: 0;
          color: #1f2937;
          font-size: 1rem;
          font-weight: 600;
        }

        .card-subtitle {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .edit-actions {
          display: flex;
          gap: 4px;
        }

        .card-content {
          padding: 16px;
        }

        .username-display {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .username-text {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          color: #374151;
          background: #f3f4f6;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
        }

        .username-formatted {
          font-size: 0.75rem;
          color: #6b7280;
          font-style: italic;
        }

        .display-name-display {
          min-height: 40px;
          display: flex;
          align-items: center;
        }

        .display-name-text {
          font-size: 1rem;
          color: #1f2937;
          font-weight: 500;
        }

        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .display-name-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
          background: white;
          color: #1f2937;
        }

        .display-name-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .error-message {
          color: #dc2626;
          font-size: 0.875rem;
          margin-top: 4px;
        }

        .btn {
          padding: 6px;
          border: none;
          border-radius: 6px;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn:hover {
          background: #f3f4f6;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-success {
          color: #10b981;
        }

        .btn-danger {
          color: #ef4444;
        }

        .btn-text {
          color: #6b7280;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
