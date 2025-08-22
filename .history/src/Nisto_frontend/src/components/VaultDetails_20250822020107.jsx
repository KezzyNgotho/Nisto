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
  FiCrown,
  FiStar
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
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#1e293b' }}>
              {vault.name}
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>
              {vault.vaultType} Vault • {vault.isPublic ? 'Public' : 'Private'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#64748b',
              padding: '0.5rem'
            }}
          >
            <FiX />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          background: '#f8fafc'
        }}>
          {['overview', 'members', 'transactions', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '1rem',
                background: activeTab === tab ? 'white' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #3b82f6' : 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: activeTab === tab ? '600' : '500',
                color: activeTab === tab ? '#3b82f6' : '#64748b',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          {activeTab === 'overview' && (
            <div>
              {/* Vault Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  padding: '1rem',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <FiDollarSign style={{ color: '#059669' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#059669' }}>Current Balance</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#059669' }}>
                    {showBalances ? formatAmount(vault.balance || 0) : '***'} {vault.currency || 'NST'}
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <FiTarget style={{ color: '#d97706' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#d97706' }}>Target Amount</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#d97706' }}>
                    {showBalances ? formatAmount(vault.targetAmount || 0) : '***'} {vault.currency || 'NST'}
                  </div>
                </div>

                                 <div style={{
                   padding: '1rem',
                   background: '#eff6ff',
                   border: '1px solid #bfdbfe',
                   borderRadius: '0.5rem'
                 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <FiUsers style={{ color: '#2563eb' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#2563eb' }}>Members</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2563eb' }}>
                    {vault.memberCount || 0}
                  </div>
                </div>

                                 <div style={{
                   padding: '1rem',
                   background: '#f3e8ff',
                   border: '1px solid #c4b5fd',
                   borderRadius: '0.5rem'
                 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <FiCalendar style={{ color: '#7c3aed' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#7c3aed' }}>Created</span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '500', color: '#7c3aed' }}>
                    {formatDate(vault.createdAt)}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>
                  Description
                </h3>
                <p style={{ margin: 0, color: '#64748b', lineHeight: '1.6' }}>
                  {vault.description || 'No description available'}
                </p>
              </div>

              {/* Progress Bar */}
              {vault.targetAmount && (
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Progress</span>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>
                  Members ({vault.members?.length || 0})
                </h3>
                {canManage && (
                  <button style={{
                    padding: '0.5rem 1rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FiUserPlus size={16} />
                    Invite Member
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {vault.members?.map((member, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: getRoleColor(member.role),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        {getRoleIcon(member.role)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', color: '#1e293b' }}>
                          {member.displayName || member.username || 'Unknown User'}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {member.userId?.slice(0, 8)}...{member.userId?.slice(-6)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: getRoleColor(member.role) + '20',
                        color: getRoleColor(member.role),
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
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
                          color: '#64748b',
                          padding: '0.25rem'
                        }}>
                          <FiEdit2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )) || (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No members found
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>
                Recent Transactions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {details?.transactions?.map((tx, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                        <div style={{ fontWeight: '500', color: '#1e293b', textTransform: 'capitalize' }}>
                          {tx.type}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {tx.description || 'No description'}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: tx.type === 'deposit' ? '#059669' : '#dc2626',
                        fontSize: '1rem'
                      }}>
                        {tx.type === 'deposit' ? '+' : '-'}{formatAmount(tx.amount)} {vault.currency || 'NST'}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        {formatDate(tx.timestamp)}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No transactions found
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && canManage && (
            <div>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>
                Vault Settings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}>
                  <span>Edit Vault</span>
                  <FiEdit2 size={16} />
                </button>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}>
                  <span>Change Privacy</span>
                  {vault.isPublic ? <FiGlobe size={16} /> : <FiLock size={16} />}
                </button>
                {isOwner && (
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
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
