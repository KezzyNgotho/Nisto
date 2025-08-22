import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { FiUsers, FiPlus, FiDollarSign, FiTarget, FiTrendingUp, FiCheck, FiX, FiLock, FiUnlock, FiEdit2, FiTrash2, FiUserPlus, FiEye, FiChevronDown, FiChevronUp, FiShield, FiArrowDownCircle, FiArrowUpCircle, FiList, FiSend, FiChevronLeft, FiGlobe } from 'react-icons/fi';
import { AiFillCrown } from 'react-icons/ai';
import VaultDetails from './VaultDetails';
import PublicVaults from './PublicVaults';

export default function GroupVaults() {
  const { theme } = useTheme();
  // Add CSS animations for modals
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
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
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const { 
    getUserGroupVaults, 
    createGroupVault, 
    getVaultDetails, 
    depositToVault, 
    inviteVaultMember,
    removeVaultMember,
    changeVaultMemberRole,
    user, 
    isAuthenticated, 
    login 
  } = useAuth();
  
  const { showToast } = useNotification();
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedVaultId, setExpandedVaultId] = useState(null);
  const [vaultDetails, setVaultDetails] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newVault, setNewVault] = useState({ name: '', description: '', vaultType: 'Savings', currency: '', targetAmount: '', isPublic: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const createBtnRef = useRef();
  
  // Add state for all modals
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showPropose, setShowPropose] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showChangeRole, setShowChangeRole] = useState(false);
  const [showRemoveMember, setShowRemoveMember] = useState(false);
  const [selectedVault, setSelectedVault] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Add useState for all modal form fields
  const [editForm, setEditForm] = useState({ name: '', description: '', currency: '', targetAmount: '', isPublic: false });
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDesc, setDepositDesc] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDesc, setWithdrawDesc] = useState('');
  const [proposeType, setProposeType] = useState('DeleteVault');
  const [proposeTarget, setProposeTarget] = useState('');
  const [proposeRole, setProposeRole] = useState('member');
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [newRole, setNewRole] = useState('member');
  const [showVaultDetails, setShowVaultDetails] = useState(false);
  const [vaultView, setVaultView] = useState('my-vaults'); // 'my-vaults' or 'public-vaults'
  const [selectedVaultForDetails, setSelectedVaultForDetails] = useState(null);

  useEffect(() => {
    const fetchVaults = async () => {
      if (!isAuthenticated) {
        await login();
        return;
      }
      setLoading(true);
      try {
        const vs = await getUserGroupVaults();
        setVaults(vs || []);
      } catch (err) {
        setVaults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVaults();
  }, [getUserGroupVaults, isAuthenticated, login]);

  const handleExpand = async (vaultId) => {
    if (expandedVaultId === vaultId) {
      setExpandedVaultId(null);
      setVaultDetails(null);
    } else {
      setExpandedVaultId(vaultId);
      try {
        const details = await getVaultDetails(vaultId);
        setVaultDetails(details);
      } catch {
        setVaultDetails(null);
        showToast({ message: 'Failed to load vault details', type: 'error', icon: <FiDollarSign /> });
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await createGroupVault(
        newVault.name, 
        newVault.description, 
        newVault.vaultType,
        newVault.currency, 
        newVault.targetAmount ? parseFloat(newVault.targetAmount) : null, 
        newVault.isPublic, 
        null
      );
      
      if (result.ok) {
      setShowCreate(false);
        setNewVault({ name: '', description: '', vaultType: 'Savings', currency: '', targetAmount: '', isPublic: false });
        showToast({ message: 'Vault created successfully!', type: 'success', icon: <FiCheck /> });
        
      if (getUserGroupVaults) {
        const userVaults = await getUserGroupVaults();
        setVaults(userVaults || []);
        }
      } else {
        setError(result.err || 'Failed to create vault');
        showToast({ message: result.err || 'Failed to create vault', type: 'error', icon: <FiDollarSign /> });
      }
    } catch (err) {
      console.error('Create vault error:', err);
      setError('Failed to create vault');
      showToast({ message: 'Failed to create vault', type: 'error', icon: <FiDollarSign /> });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditOpen = (vault) => {
    setSelectedVault(vault);
    setEditForm({
      name: vault.name || '',
      description: vault.description || '',
      currency: vault.currency || '',
      targetAmount: vault.targetAmount || '',
      isPublic: vault.isPublic || false
    });
    setShowEdit(true);
  };

  const handleOpenVaultDetails = async (vault) => {
    setSelectedVaultForDetails(vault);
    setShowVaultDetails(true);
    try {
      console.log('Getting vault details for vault:', vault.id);
      const details = await getVaultDetails(vault.id);
      console.log('Vault details received:', details);
      setVaultDetails(details);
    } catch (error) {
      console.error('Error getting vault details:', error);
      setVaultDetails(null);
      showToast({ message: 'Failed to load vault details', type: 'error', icon: <FiDollarSign /> });
    }
  };

  const handleBackToVaults = () => {
    setShowVaultDetails(false);
    setSelectedVaultForDetails(null);
    setVaultDetails(null);
  };

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '200px',
      color: theme.colors.text.secondary,
      fontSize: '1rem'
    }}>
      Loading group vaults...
    </div>
  );

  return (
    <div style={{ width: '100%', padding: '0', margin: 0 }}>
      {/* Sleek Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '2rem', 
        background: theme.colors.white,
        borderRadius: '0.75rem',
        padding: '0.5rem',
        border: `1px solid ${theme.colors.border.secondary}`,
        boxShadow: `0 2px 8px ${theme.colors.shadow.light}`
      }}>
        <button
          onClick={() => setVaultView('my-vaults')}
          style={{
            flex: 1,
            padding: '1rem 1.5rem',
            border: 'none',
            borderRadius: '0.75rem',
            background: vaultView === 'my-vaults' ? '#3b82f6' : 'transparent',
            color: vaultView === 'my-vaults' ? 'white' : '#64748b',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <FiUsers size={16} />
          My Vaults
        </button>
        <button
          onClick={() => setVaultView('public-vaults')}
          style={{
            flex: 1,
            padding: '1rem 1.5rem',
            border: 'none',
            borderRadius: '0.75rem',
            background: vaultView === 'public-vaults' ? '#3b82f6' : 'transparent',
            color: vaultView === 'public-vaults' ? 'white' : '#64748b',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <FiGlobe size={16} />
          Discover Vaults
        </button>
      </div>

      {/* Show Public Vaults or My Vaults based on selected tab */}
      {vaultView === 'public-vaults' ? (
        <PublicVaults />
      ) : showVaultDetails && selectedVaultForDetails && vaultDetails ? (
        /* Show Vault Details Component */
        <VaultDetails
          vault={selectedVaultForDetails}
          details={vaultDetails}
          onBack={handleBackToVaults}
          user={user}
          showToast={showToast}
        />
      ) : (
        /* Show Vault Cards */
        <>
          {/* Minimal Create Vault Button */}
        <div style={{
          display: 'flex',
            justifyContent: 'flex-end', 
          alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <button 
              ref={createBtnRef} 
              style={{ 
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
              border: 'none',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: 600,
              cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }} 
              onClick={() => setShowCreate(true)}
            >
              <FiPlus size={16} />
              Create Vault
            </button>
              </div>
              
          {/* Sleek Vault Grid */}
              <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '2rem',
            margin: 0,
            padding: 0
          }}>
            {vaults.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                color: '#64748b', 
                fontSize: '1rem', 
                padding: '3rem',
                background: '#f8fafc',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0'
              }}>
                No group vaults found.
              </div>
            ) : (
              vaults.map(vault => (
                <div key={vault.id} style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }} onClick={() => handleOpenVaultDetails(vault)}>
                  {/* Sleek Header */}
        <div style={{
          display: 'flex',
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: 700, 
                        color: '#1e293b',
                        margin: '0 0 0.5rem 0',
                        letterSpacing: '-0.025em'
                      }}>
                        {vault.name}
                      </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.75rem'
                      }}>
                  <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: vault.isPublic ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                          color: 'white',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {vault.isPublic ? <FiGlobe size={10} /> : <FiLock size={10} />}
                          {vault.isPublic ? 'Public' : 'Private'}
                  </span>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                      fontWeight: 600,
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          color: 'white',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {typeof vault.vaultType === 'object' ? Object.keys(vault.vaultType)[0] : vault.vaultType}
                        </span>
                </div>
              </div>
              </div>
              
                  {/* Sleek Description */}
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#64748b',
                    lineHeight: '1.4',
                    margin: '0 0 1.5rem 0',
                    fontWeight: 400
                  }}>
                    {vault.description || 'No description provided'}
                  </p>

                  {/* Sleek Stats Row */}
              <div style={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                padding: '1rem',
                    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                    borderRadius: '0.75rem',
                    border: '1px solid #cbd5e1'
                  }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance</div>
                      <div style={{ fontSize: '1rem', color: '#059669', fontWeight: 700, letterSpacing: '-0.025em' }}>{vault.totalBalance}</div>
                </div>
                    <div style={{ width: '1px', height: '2rem', background: 'linear-gradient(180deg, #cbd5e1 0%, #94a3b8 50%, #cbd5e1 100%)' }} />
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Currency</div>
                      <div style={{ fontSize: '1rem', color: '#2563eb', fontWeight: 700, letterSpacing: '-0.025em' }}>{vault.currency}</div>
              </div>
            </div>
            
                  {/* Sleek Action Buttons */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    justifyContent: 'space-between'
                  }}>
              <button 
                style={{
                  flex: 1,
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                  fontWeight: 600,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  border: 'none',
                  color: 'white',
                        borderRadius: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                        letterSpacing: '0.025em'
                      }}
                      onClick={(e) => { e.stopPropagation(); handleOpenVaultDetails(vault); }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                      }}
                    >
        <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <FiEye size={12} />
                      </div>
                      View Details
                    </button>
                    <button 
                      style={{ 
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
                        color: 'white',
                        borderRadius: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}
                      onClick={(e) => { e.stopPropagation(); setSelectedVault(vault); setShowDeposit(true); }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                      }}
                    >
              <div style={{
                        width: '20px',
                        height: '20px',
                borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                        backdropFilter: 'blur(10px)'
              }}>
                        <FiArrowDownCircle size={12} />
              </div>
                    </button>
                    <button 
                    style={{
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                      fontWeight: 600,
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                      }}
                      onClick={(e) => { e.stopPropagation(); setSelectedVault(vault); setShowWithdraw(true); }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                      }}
                    >
              <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <FiArrowUpCircle size={12} />
                </div>
                    </button>
              <button 
                style={{
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                  fontWeight: 600,
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        borderRadius: '0.75rem',
                  cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}
                      onClick={(e) => { e.stopPropagation(); handleEditOpen(vault); }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                        e.target.style.background = 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                        e.target.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
                      }}
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'rgba(71, 85, 105, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FiEdit2 size={12} />
            </div>
                    </button>
        </div>
            </div>
              ))
            )}
            </div>
        </>
      )}

      {/* Create Vault Modal */}
      {showCreate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }} onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <form onSubmit={handleCreate} style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            width: '90%',
            maxWidth: 600,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideUp 0.3s ease-out',
            border: '1px solid #e2e8f0',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setShowCreate(false)} style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'rgba(0, 0, 0, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'all 0.2s'
            }}>
              <FiX size={14} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: 48,
                height: 48,
                background: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem'
              }}>
                <FiPlus size={20} color="white" />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Create New Vault</h2>
              <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.8rem' }}>Set up a new group vault for collaborative savings</p>
            </div>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {/* First Row - Name and Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600, color: '#374151', fontSize: '0.75rem' }}>Vault Name *</label>
                <input 
                  type="text" 
                    placeholder="Enter vault name" 
                    value={newVault.name} 
                    onChange={e => setNewVault(v => ({ ...v, name: e.target.value }))} 
                  required 
                  style={{
                    width: '100%',
                      padding: '0.625rem 0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
              <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600, color: '#374151', fontSize: '0.75rem' }}>Type *</label>
                <select 
                    value={newVault.vaultType} 
                    onChange={e => setNewVault(v => ({ ...v, vaultType: e.target.value }))} 
                  required 
                  style={{
                    width: '100%',
                      padding: '0.625rem 0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    outline: 'none',
                    background: 'white'
                  }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  >
                    <option value="Savings">💰 Savings</option>
                    <option value="Investment">📈 Investment</option>
                    <option value="Emergency">🚨 Emergency</option>
                    <option value="Travel">✈️ Travel</option>
                    <option value="Education">🎓 Education</option>
                    <option value="Business">💼 Business</option>
                    <option value="Charity">🤝 Charity</option>
                    <option value="Custom">🎯 Custom</option>
                </select>
              </div>
            </div>
            
              {/* Second Row - Currency and Target */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600, color: '#374151', fontSize: '0.75rem' }}>Currency *</label>
                  <input 
                    type="text" 
                    placeholder="KES" 
                    value={newVault.currency} 
                    onChange={e => setNewVault(v => ({ ...v, currency: e.target.value }))} 
                    required 
                style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                  transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
            </div>
              <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600, color: '#374151', fontSize: '0.75rem' }}>Target Amount</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={newVault.targetAmount} 
                    onChange={e => setNewVault(v => ({ ...v, targetAmount: e.target.value }))} 
                  style={{
                    width: '100%',
                      padding: '0.625rem 0.75rem',
                      border: `1px solid ${theme.colors.border.primary}`,
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                    transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = `rgba(${theme.colors.primary.r}, ${theme.colors.primary.g}, ${theme.colors.primary.b}, 1)`}
                    onBlur={(e) => e.target.style.borderColor = `rgba(${theme.colors.border.primary.r}, ${theme.colors.border.primary.g}, ${theme.colors.border.primary.b}, 1)`}
                  />
              </div>
            </div>
            
              {/* Third Row - Description */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600, color: `rgba(${theme.colors.text.secondary.r}, ${theme.colors.text.secondary.g}, ${theme.colors.text.secondary.b}, 1)`, fontSize: '0.75rem' }}>Description</label>
                <textarea 
                  placeholder="Describe the purpose of this vault" 
                  value={newVault.description} 
                  onChange={e => setNewVault(v => ({ ...v, description: e.target.value }))} 
                style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                  transition: 'all 0.2s',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: 60,
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = `rgba(${theme.colors.primary.r}, ${theme.colors.primary.g}, ${theme.colors.primary.b}, 1)`}
                  onBlur={(e) => e.target.style.borderColor = `rgba(${theme.colors.border.primary.r}, ${theme.colors.border.primary.g}, ${theme.colors.border.primary.b}, 1)`}
                />
            </div>
              
              {/* Fourth Row - Public Toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: `rgba(${theme.colors.background.secondary.r}, ${theme.colors.background.secondary.g}, ${theme.colors.background.secondary.b}, 1)`,
                borderRadius: '0.5rem',
                border: `1px solid ${theme.colors.border.primary}`
              }}>
                <input 
                  type="checkbox" 
                  checked={newVault.isPublic} 
                  onChange={e => setNewVault(v => ({ ...v, isPublic: e.target.checked }))}
                  style={{ width: 16, height: 16 }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: `rgba(${theme.colors.primary.r}, ${theme.colors.primary.g}, ${theme.colors.primary.b}, 1)`, fontSize: '0.8rem' }}>Public Vault</div>
                  <div style={{ fontSize: '0.7rem', color: `rgba(${theme.colors.text.secondary.r}, ${theme.colors.text.secondary.g}, ${theme.colors.text.secondary.b}, 1)`, marginTop: '0.125rem' }}>
                    Allow others to discover and join this vault
              </div>
            </div>
                </div>
              </div>
              
            {error && (
              <div style={{
                background: `rgba(${theme.colors.background.secondary.r}, ${theme.colors.background.secondary.g}, ${theme.colors.background.secondary.b}, 1)`,
                color: `rgba(${theme.colors.error.r}, ${theme.colors.error.g}, ${theme.colors.error.b}, 1)`,
                padding: '0.625rem 0.75rem',
                borderRadius: '0.5rem',
                border: `1px solid ${theme.colors.error}`,
                fontSize: '0.8rem',
                marginTop: '1rem'
              }}>
                {error}
                </div>
            )}
            
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button 
                type="button" 
                onClick={() => setShowCreate(false)}
                style={{
                  flex: 1,
                  padding: '0.625rem 1rem',
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: '0.5rem',
                  background: 'white',
                  color: `rgba(${theme.colors.text.secondary.r}, ${theme.colors.text.secondary.g}, ${theme.colors.text.secondary.b}, 1)`,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '0.625rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  background: submitting ? `rgba(${theme.colors.text.secondary.r}, ${theme.colors.text.secondary.g}, ${theme.colors.text.secondary.b}, 1)` : `rgba(${theme.colors.primary.r}, ${theme.colors.primary.g}, ${theme.colors.primary.b}, 1)`,
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
              >
                {submitting ? 'Creating...' : 'Create Vault'}
                  </button>
                </div>
          </form>
                      </div>
      )}
    </div>
  );
}
  