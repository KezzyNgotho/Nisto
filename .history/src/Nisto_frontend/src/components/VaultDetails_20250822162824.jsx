import React, { useState } from 'react';
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
      case 'owner': return <AiFillCrown style={{ color: '#f59e0b' }} />;
      case 'admin': return <FiShield style={{ color: '#3b82f6' }} />;
      case 'member': return <FiUser style={{ color: '#6b7280' }} />;
      default: return <FiUser />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return '#f59e0b';
      case 'admin': return '#3b82f6';
      case 'member': return '#6b7280';
      default: return '#6b7280';
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
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#111827' }}>
              {vault.name}
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
              {typeof vault.vaultType === 'object' ? (vault.vaultType.Savings || 'Savings') : vault.vaultType} Vault • {vault.isPublic ? 'Public' : 'Private'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '8px',
              borderRadius: '4px',
              transition: 'background 0.2s'
            }}
          >
            <FiX />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb'
        }}>
          {['overview', 'members', 'transactions', 'chat', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '16px',
                background: activeTab === tab ? 'white' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #3b82f6' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab ? '600' : '500',
                color: activeTab === tab ? '#3b82f6' : '#6b7280',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {activeTab === 'overview' && (
            <div>
              {/* Vault Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
              }}>
                <div style={{
                  padding: '16px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FiDollarSign style={{ color: '#059669' }} />
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#059669' }}>Current Balance</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: '#059669' }}>
                    {showBalances ? formatAmount(vault.balance || 0) : '***'} {vault.currency || 'NST'}
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FiTarget style={{ color: '#d97706' }} />
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#d97706' }}>Target Amount</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: '#d97706' }}>
                    {showBalances ? formatAmount(vault.targetAmount || 0) : '***'} {vault.currency || 'NST'}
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FiUsers style={{ color: '#2563eb' }} />
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#2563eb' }}>Members</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: '#2563eb' }}>
                    {vault.memberCount || 0}
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  background: '#f3e8ff',
                  border: '1px solid #c4b5fd',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FiCalendar style={{ color: '#7c3aed' }} />
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#7c3aed' }}>Created</span>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#7c3aed' }}>
                    {formatDate(vault.createdAt)}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  Description
                </h3>
                <p style={{ margin: 0, color: '#6b7280', lineHeight: '1.6' }}>
                  {vault.description || 'No description available'}
                </p>
              </div>

              {/* Progress Bar */}
              {vault.targetAmount && (
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Progress</span>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>
                      {Math.round((Number(vault.balance || 0) / Number(vault.targetAmount)) * 100)}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min((Number(vault.balance || 0) / Number(vault.targetAmount)) * 100, 100)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #10b981, #059669)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  Members ({vault.members?.length || 0})
                </h3>
                {canManage && (
                  <button style={{
                    padding: '8px 16px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s'
                  }}>
                    <FiUserPlus size={16} />
                    Invite Member
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {vault.members?.map((member, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: getRoleColor(member.role),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        {getRoleIcon(member.role)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', color: '#111827' }}>
                          {member.displayName || member.username || 'Unknown User'}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                          {member.userId?.slice(0, 8)}...{member.userId?.slice(-6)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        padding: '4px 12px',
                        background: getRoleColor(member.role) + '20',
                        color: getRoleColor(member.role),
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}>
                        {member.role}
                      </span>
                      {canManage && member.role !== 'owner' && (
                        <button style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6b7280',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'background 0.2s'
                        }}>
                          <FiEdit2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )) || (
                  <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                    No members found
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                Recent Transactions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {details?.transactions?.map((tx, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: tx.type === 'deposit' ? '#10b981' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        {tx.type === 'deposit' ? <FiArrowUp size={20} /> : <FiArrowDown size={20} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', color: '#111827', textTransform: 'capitalize' }}>
                          {tx.type}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                          {tx.description || 'No description'}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: tx.type === 'deposit' ? '#059669' : '#dc2626',
                        fontSize: '16px'
                      }}>
                        {tx.type === 'deposit' ? '+' : '-'}{formatAmount(tx.amount)} {vault.currency || 'NST'}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        {formatDate(tx.timestamp)}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                    No transactions found
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  Vault Chat
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    fontSize: '14px', 
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: '#10b981' 
                    }} />
                    {vault.members?.length || 0} members online
                  </span>
                </div>
              </div>

              {/* Chat Messages */}
              <div style={{ 
                flex: 1, 
                overflow: 'auto', 
                marginBottom: '16px',
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                maxHeight: '400px'
              }}>
                {details?.messages?.map((message, index) => (
                  <div key={index} style={{
                    marginBottom: '16px',
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: message.senderId === user?.principal ? '#3b82f6' : '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '600',
                      flexShrink: 0
                    }}>
                      {(message.senderName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        marginBottom: '4px' 
                      }}>
                        <span style={{ 
                          fontWeight: '500', 
                          color: '#111827',
                          fontSize: '14px'
                        }}>
                          {message.senderName || 'Unknown User'}
                        </span>
                        <span style={{ 
                          fontSize: '12px', 
                          color: '#6b7280' 
                        }}>
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                      <div style={{
                        padding: '12px',
                        background: message.senderId === user?.principal ? '#dbeafe' : 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        color: '#111827',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        {message.content}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '32px', 
                    color: '#6b7280',
                    fontStyle: 'italic'
                  }}>
                    No messages yet. Start the conversation!
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-end'
              }}>
                <div style={{ flex: 1 }}>
                  <textarea
                    placeholder="Type your message..."
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        // Handle send message
                      }
                    }}
                  />
                </div>
                <button style={{
                  padding: '12px 24px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: '60px'
                }}>
                  <FiSend size={16} />
                  Send
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && canManage && (
            <div>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                Vault Settings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  <span>Edit Vault</span>
                  <FiEdit2 size={16} />
                </button>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  <span>Change Privacy</span>
                  {vault.isPublic ? <FiGlobe size={16} /> : <FiLock size={16} />}
                </button>
                {isOwner && (
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#dc2626'
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
    </div>
  );
};

export default VaultDetails;
