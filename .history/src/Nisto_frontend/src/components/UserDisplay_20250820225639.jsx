import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { FiUser, FiCopy, FiInfo, FiX } from 'react-icons/fi';
import { 
  formatUsername, 
  getUsernameColor, 
  getInitials 
} from '../utils/usernameUtils';

export default function UserDisplay({ 
  showUsername = false, 
  showPrincipal = false, 
  compact = false,
  className = '',
  onClick = null 
}) {
  const { user, principal } = useAuth();
  const { showToast } = useNotification();
  const [showTooltip, setShowTooltip] = useState(false);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard`, 'success');
  };



  if (compact) {
    return (
      <div 
        className={`user-display-compact ${className}`}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        <div 
          className="user-avatar-compact"
          style={{ background: getUsernameColor(user?.username) }}
          title={user?.displayName || formatUsername(user?.username)}
        >
          {getInitials(user?.displayName, user?.username)}
        </div>
        <span className="user-name-compact">
          {user?.displayName || formatUsername(user?.username)}
        </span>
      </div>
    );
  }

  return (
    <div className={`user-display ${className}`}>
      <div 
        className="user-avatar"
        style={{ background: getUsernameColor(user?.username) }}
        onClick={() => setShowTooltip(!showTooltip)}
        title="Click for user info"
      >
        {getInitials(user?.displayName, user?.username)}
      </div>
      
      <div className="user-info">
        <div className="user-name">
          {user?.displayName || formatUsername(user?.username)}
        </div>
        {showUsername && user?.username && (
          <div className="user-username">
            @{user.username}
          </div>
        )}
        {showPrincipal && principal && (
          <div className="user-principal">
            {principal.slice(0, 8)}...{principal.slice(-6)}
          </div>
        )}
      </div>

      {/* Tooltip with detailed user info */}
      {showTooltip && (
        <div className="user-tooltip">
          <div className="tooltip-header">
            <span>User Information</span>
            <button 
              className="tooltip-close"
              onClick={() => setShowTooltip(false)}
            >
              <FiX />
            </button>
          </div>
          
          <div className="tooltip-content">
            <div className="tooltip-section">
              <label>Display Name:</label>
              <div className="tooltip-value">
                {user?.displayName || 'Not set'}
                <button 
                  className="tooltip-copy"
                  onClick={() => copyToClipboard(user?.displayName || '', 'Display name')}
                >
                  <FiCopy />
                </button>
              </div>
            </div>
            
            <div className="tooltip-section">
              <label>System Username:</label>
              <div className="tooltip-value">
                <code>{user?.username || '—'}</code>
                <button 
                  className="tooltip-copy"
                  onClick={() => copyToClipboard(user?.username || '', 'Username')}
                >
                  <FiCopy />
                </button>
              </div>
            </div>
            
            <div className="tooltip-section">
              <label>Principal ID:</label>
              <div className="tooltip-value">
                <code>{principal || '—'}</code>
                <button 
                  className="tooltip-copy"
                  onClick={() => copyToClipboard(principal || '', 'Principal ID')}
                >
                  <FiCopy />
                </button>
              </div>
            </div>
            
            <div className="tooltip-section">
              <label>Account Created:</label>
              <div className="tooltip-value">
                {user?.createdAt ? new Date(Number(user.createdAt)).toLocaleDateString() : '—'}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .user-display {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }

        .user-display-compact {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .user-avatar:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .user-avatar-compact {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 12px;
          flex-shrink: 0;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .user-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 14px;
        }

        .user-name-compact {
          font-weight: 500;
          color: #374151;
          font-size: 13px;
        }

        .user-username {
          font-size: 12px;
          color: #6b7280;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }

        .user-principal {
          font-size: 11px;
          color: #9ca3af;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }

        .user-tooltip {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          min-width: 280px;
          margin-top: 8px;
        }

        .tooltip-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
          border-radius: 8px 8px 0 0;
        }

        .tooltip-header span {
          font-weight: 600;
          color: #1f2937;
          font-size: 14px;
        }

        .tooltip-close {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tooltip-close:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .tooltip-content {
          padding: 16px;
        }

        .tooltip-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .tooltip-section:last-child {
          border-bottom: none;
        }

        .tooltip-section label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .tooltip-value {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #374151;
        }

        .tooltip-value code {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
        }

        .tooltip-copy {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .tooltip-copy:hover {
          background: #f3f4f6;
          color: #374151;
        }

        @media (max-width: 768px) {
          .user-tooltip {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90vw;
            max-width: 320px;
            margin-top: 0;
          }
        }
      `}</style>
    </div>
  );
}
