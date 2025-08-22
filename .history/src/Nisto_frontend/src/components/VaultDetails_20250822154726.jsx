import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  FiUsers, 
  FiDollarSign, 
  FiCalendar, 
  FiEye, 
  FiEyeOff,
  FiX,
  FiEdit2,
  FiTrash2,
  FiUserPlus,
  FiSend,
  FiDownload,
  FiShield,
  FiLock,
  FiUnlock,
  FiTrendingUp,
  FiTarget,
  FiCheck,
  FiClock,
  FiAlertCircle,
  FiArrowUp,
  FiArrowDown,
  FiUser,
  FiStar,
  FiGlobe
} from 'react-icons/fi';
import { AiFillCrown } from 'react-icons/ai';

const VaultDetails = ({ vault, details, onClose }) => {
  const { showToast } = useNotification();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showBalances, setShowBalances] = useState(true);

  if (!vault) return null;

  const isOwner = vault.owner === user?.principal;
  const isAdmin = vault.members?.some(m => m.userId === user?.principal && m.role === 'admin');
  const canManage = isOwner || isAdmin;

  const formatAmount = (amount) => {
    if (typeof amount === 'bigint') {
      return (Number(amount) / 100000000).toFixed(8);
    }
    return amount?.toString() || '0';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = new Date(Number(timestamp) / 1000000);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return <AiFillCrown style={{ color: 'var(--warning-color)' }} />;
      case 'admin': return <FiShield style={{ color: 'var(--info-color)' }} />;
      case 'member': return <FiUser style={{ color: 'var(--secondary-text)' }} />;
      default: return <FiUser />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'var(--warning-color)';
      case 'admin': return 'var(--info-color)';
      case 'member': return 'var(--secondary-text)';
      default: return 'var(--secondary-text)';
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
        background: 'var(--primary-bg)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp 0.3s ease-out',
        boxShadow: 'var(--shadow-heavy)'
      }}>
        {/* Header */}
        <div style={{
          padding: 'var(--space-lg)',
          borderBottom: `1px solid var(--neutral-200)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: 'var(--font-size-2xl)', 
              fontWeight: 'var(--font-weight-semibold)', 
              color: 'var(--primary-text)' 
            }}>
              {vault.name}
            </h2>
            <p style={{ 
              margin: 'var(--space-xs) 0 0 0', 
              color: 'var(--secondary-text)', 
              fontSize: 'var(--font-size-sm)' 
            }}>
              {vault.vaultType} Vault • {vault.isPublic ? 'Public' : 'Private'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 'var(--font-size-2xl)',
              cursor: 'pointer',
              color: 'var(--secondary-text)',
              padding: 'var(--space-sm)',
              borderRadius: 'var(--radius-sm)',
              transition: 'var(--transition-normal)'
            }}
          >
            <FiX />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid var(--neutral-200)`,
          background: 'var(--neutral-50)'
        }}>
          {['overview', 'members', 'transactions', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: 'var(--space-md)',
                background: activeTab === tab ? 'var(--primary-bg)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? `2px solid var(--primary-accent)` : 'none',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: activeTab === tab ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                color: activeTab === tab ? 'var(--primary-accent)' : 'var(--secondary-text)',
                textTransform: 'capitalize',
                transition: 'var(--transition-normal)'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-lg)' }}>
          {activeTab === 'overview' && (
            <div>
              {/* Vault Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-2xl)'
              }}>
                <div style={{
                  padding: 'var(--space-md)',
                  background: 'var(--success-50)',
                  border: `1px solid var(--success-200)`,
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--space-sm)', 
                    marginBottom: 'var(--space-sm)' 
                  }}>
                    <FiDollarSign style={{ color: 'var(--success-color)' }} />
                    <span style={{ 
                      fontSize: 'var(--font-size-sm)', 
                      fontWeight: 'var(--font-weight-medium)', 
                      color: 'var(--success-color)' 
                    }}>
                      Current Balance
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: 'var(--font-size-2xl)', 
                    fontWeight: 'var(--font-weight-semibold)', 
                    color: 'var(--success-color)' 
                  }}>
                    {showBalances ? formatAmount(vault.balance || 0) : '***'} {vault.currency || 'NST'}
                  </div>
                </div>

                <div style={{
                  padding: 'var(--space-md)',
                  background: 'var(--warning-50)',
                  border: `1px solid var(--warning-200)`,
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--space-sm)', 
                    marginBottom: 'var(--space-sm)' 
                  }}>
                    <FiTarget style={{ color: 'var(--warning-color)' }} />
                    <span style={{ 
                      fontSize: 'var(--font-size-sm)', 
                      fontWeight: 'var(--font-weight-medium)', 
                      color: 'var(--warning-color)' 
                    }}>
                      Target Amount
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: 'var(--font-size-2xl)', 
                    fontWeight: 'var(--font-weight-semibold)', 
                    color: 'var(--warning-color)' 
                  }}>
                    {showBalances ? formatAmount(vault.targetAmount || 0) : '***'} {vault.currency || 'NST'}
                  </div>
                </div>

                <div style={{
                  padding: 'var(--space-md)',
                  background: 'var(--primary-50)',
                  border: `1px solid var(--primary-200)`,
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--space-sm)', 
                    marginBottom: 'var(--space-sm)' 
                  }}>
                    <FiUsers style={{ color: 'var(--primary-accent)' }} />
                    <span style={{ 
                      fontSize: 'var(--font-size-sm)', 
                      fontWeight: 'var(--font-weight-medium)', 
                      color: 'var(--primary-accent)' 
                    }}>
                      Members
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: 'var(--font-size-2xl)', 
                    fontWeight: 'var(--font-weight-semibold)', 
                    color: 'var(--primary-accent)' 
                  }}>
                    {vault.memberCount || 0}
                  </div>
                </div>

                <div style={{
                  padding: 'var(--space-md)',
                  background: 'var(--neutral-50)',
                  border: `1px solid var(--neutral-200)`,
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--space-sm)', 
                    marginBottom: 'var(--space-sm)' 
                  }}>
                    <FiCalendar style={{ color: 'var(--secondary-text)' }} />
                    <span style={{ 
                      fontSize: 'var(--font-size-sm)', 
                      fontWeight: 'var(--font-weight-medium)', 
                      color: 'var(--secondary-text)' 
                    }}>
                      Created
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: 'var(--font-size-base)', 
                    fontWeight: 'var(--font-weight-medium)', 
                    color: 'var(--secondary-text)' 
                  }}>
                    {formatDate(vault.createdAt)}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <h3 style={{ 
                  margin: '0 0 var(--space-md) 0', 
                  fontSize: 'var(--font-size-lg)', 
                  fontWeight: 'var(--font-weight-semibold)', 
                  color: 'var(--primary-text)' 
                }}>
                  Description
                </h3>
                <p style={{ 
                  margin: 0, 
                  color: 'var(--secondary-text)', 
                  lineHeight: '1.6' 
                }}>
                  {vault.description || 'No description available'}
                </p>
              </div>

              {/* Progress Bar */}
              {vault.targetAmount && (
                <div style={{ marginBottom: 'var(--space-2xl)' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: 'var(--space-sm)' 
                  }}>
                    <span style={{ 
                      fontSize: 'var(--font-size-sm)', 
                      fontWeight: 'var(--font-weight-medium)', 
                      color: 'var(--primary-text)' 
                    }}>
                      Progress
                    </span>
                    <span style={{ 
                      fontSize: 'var(--font-size-sm)', 
                      color: 'var(--secondary-text)' 
                    }}>
                      {Math.round((Number(vault.balance || 0) / Number(vault.targetAmount)) * 100)}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--neutral-200)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min((Number(vault.balance || 0) / Number(vault.targetAmount)) * 100, 100)}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, var(--success-color), var(--success-600))`,
                      transition: 'width var(--transition-slow)'
                    }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 'var(--space-lg)' 
              }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: 'var(--font-size-lg)', 
                  fontWeight: 'var(--font-weight-semibold)', 
                  color: 'var(--primary-text)' 
                }}>
                  Members ({vault.members?.length || 0})
                </h3>
                {canManage && (
                  <button style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    background: 'var(--button-primary-bg)',
                    color: 'var(--button-primary-text)',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    transition: 'var(--transition-normal)'
                  }}>
                    <FiUserPlus size={16} />
                    Invite Member
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {vault.members?.map((member, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-md)',
                    background: 'var(--card-bg)',
                    border: `1px solid var(--card-border)`,
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--card-text)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: getRoleColor(member.role),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary-bg)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)'
                      }}>
                        {getRoleIcon(member.role)}
                      </div>
                      <div>
                        <div style={{ 
                          fontWeight: 'var(--font-weight-medium)', 
                          color: 'var(--card-text)' 
                        }}>
                          {member.displayName || member.username || 'Unknown User'}
                        </div>
                        <div style={{ 
                          fontSize: 'var(--font-size-sm)', 
                          color: 'var(--secondary-text)' 
                        }}>
                          {member.userId?.slice(0, 8)}...{member.userId?.slice(-6)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                      <span style={{
                        padding: 'var(--space-xs) var(--space-3)',
                        background: getRoleColor(member.role) + '20',
                        color: getRoleColor(member.role),
                        borderRadius: 'var(--radius-xl)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-medium)',
                        textTransform: 'capitalize'
                      }}>
                        {member.role}
                      </span>
                      {canManage && member.role !== 'owner' && (
                        <button style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--secondary-text)',
                          padding: 'var(--space-xs)',
                          borderRadius: 'var(--radius-sm)',
                          transition: 'var(--transition-normal)'
                        }}>
                          <FiEdit2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )) || (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: 'var(--space-2xl)', 
                    color: 'var(--secondary-text)' 
                  }}>
                    No members found
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <h3 style={{ 
                margin: '0 0 var(--space-lg) 0', 
                fontSize: 'var(--font-size-lg)', 
                fontWeight: 'var(--font-weight-semibold)', 
                color: 'var(--primary-text)' 
              }}>
                Recent Transactions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {details?.transactions?.map((tx, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-md)',
                    background: 'var(--card-bg)',
                    border: `1px solid var(--card-border)`,
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--card-text)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: tx.type === 'deposit' ? 'var(--success-color)' : 'var(--error-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary-bg)'
                      }}>
                        {tx.type === 'deposit' ? <FiArrowUp size={20} /> : <FiArrowDown size={20} />}
                      </div>
                      <div>
                        <div style={{ 
                          fontWeight: 'var(--font-weight-medium)', 
                          color: 'var(--card-text)', 
                          textTransform: 'capitalize' 
                        }}>
                          {tx.type}
                        </div>
                        <div style={{ 
                          fontSize: 'var(--font-size-sm)', 
                          color: 'var(--secondary-text)' 
                        }}>
                          {tx.description || 'No description'}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontWeight: 'var(--font-weight-semibold)', 
                        color: tx.type === 'deposit' ? 'var(--success-color)' : 'var(--error-color)',
                        fontSize: 'var(--font-size-base)'
                      }}>
                        {tx.type === 'deposit' ? '+' : '-'}{formatAmount(tx.amount)} {vault.currency || 'NST'}
                      </div>
                      <div style={{ 
                        fontSize: 'var(--font-size-sm)', 
                        color: 'var(--secondary-text)' 
                      }}>
                        {formatDate(tx.timestamp)}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: 'var(--space-2xl)', 
                    color: 'var(--secondary-text)' 
                  }}>
                    No transactions found
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && canManage && (
            <div>
              <h3 style={{ 
                margin: '0 0 var(--space-lg) 0', 
                fontSize: 'var(--font-size-lg)', 
                fontWeight: 'var(--font-weight-semibold)', 
                color: 'var(--primary-text)' 
              }}>
                Vault Settings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-md)',
                  background: 'var(--input-bg)',
                  border: `1px solid var(--input-border)`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--input-text)',
                  transition: 'var(--transition-normal)'
                }}>
                  <span>Edit Vault</span>
                  <FiEdit2 size={16} />
                </button>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-md)',
                  background: 'var(--input-bg)',
                  border: `1px solid var(--input-border)`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--input-text)',
                  transition: 'var(--transition-normal)'
                }}>
                  <span>Change Privacy</span>
                  {vault.isPublic ? <FiGlobe size={16} /> : <FiLock size={16} />}
                </button>
                {isOwner && (
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-md)',
                    background: 'var(--error-50)',
                    border: `1px solid var(--error-200)`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--error-color)',
                    transition: 'var(--transition-normal)'
                  }}>
                    <span>Delete Vault</span>
                    <FiTrash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          )}
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
      `}</style>
    </div>
  );
};

export default VaultDetails;