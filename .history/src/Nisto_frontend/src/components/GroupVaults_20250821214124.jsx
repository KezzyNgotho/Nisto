import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { FiUsers, FiPlus, FiDollarSign, FiTarget, FiTrendingUp, FiCheck, FiX, FiLock, FiUnlock, FiEdit2, FiTrash2, FiUserPlus, FiEye, FiChevronDown, FiChevronUp, FiShield, FiArrowDownCircle, FiArrowUpCircle, FiList, FiSend, FiChevronLeft, FiGlobe } from 'react-icons/fi';
import { AiFillCrown } from 'react-icons/ai';
import VaultDetails from './VaultDetails';
import PublicVaults from './PublicVaults';

export default function GroupVaults() {
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
    setSelectedVault(vault);
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

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '200px',
      color: '#64748b',
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
        background: '#f8fafc',
        borderRadius: '1rem',
        padding: '0.5rem',
        border: '1px solid #e2e8f0'
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
      ) : (
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem',
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
                  background: 'white',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.875rem',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => handleOpenVaultDetails(vault)}
                >
                  {/* Vault Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ 
                          fontWeight: 700, 
                          fontSize: '1.125rem', 
                          color: '#1e293b'
                        }}>
                          {vault.name}
                        </span>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.25rem', 
                          fontSize: '0.75rem',
                          background: vault.isPublic ? '#dcfce7' : '#fef2f2',
                          color: vault.isPublic ? '#166534' : '#991b1b',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.5rem',
                          fontWeight: 600
                        }}>
                          {vault.isPublic ? <FiUnlock size={12} /> : <FiLock size={12} />}
                          {vault.isPublic ? 'Public' : 'Private'}
                        </div>
                      </div>
                      <div style={{ 
                        color: '#64748b', 
                        fontSize: '0.875rem', 
                        lineHeight: '1.4'
                      }}>
                        {vault.description || 'No description provided'}
                      </div>
                    </div>
                  </div>

                  {/* Vault Stats */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '1rem', 
                    marginBottom: '1.5rem',
                    background: '#f8fafc',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 600 }}>BALANCE</div>
                      <div style={{ fontSize: '1rem', color: '#10b981', fontWeight: 700 }}>{vault.totalBalance}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 600 }}>CURRENCY</div>
                      <div style={{ fontSize: '1rem', color: '#3b82f6', fontWeight: 700 }}>{vault.currency}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 600 }}>TARGET</div>
                      <div style={{ fontSize: '1rem', color: '#f59e0b', fontWeight: 700 }}>{vault.targetAmount || 'N/A'}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 600 }}>MEMBERS</div>
                      <div style={{ fontSize: '1rem', color: '#8b5cf6', fontWeight: 700 }}>{vault.members ? vault.members.length : '—'}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    flexWrap: 'wrap'
                  }}>
                    <button 
                      style={{ 
                        padding: '0.5rem 1rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: '#3b82f6',
                        border: 'none',
                        color: 'white',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                      onClick={(e) => { e.stopPropagation(); handleOpenVaultDetails(vault); }}
                    >
                      <FiEye size={12} />
                      View Details
                    </button>
                    <button 
                      style={{ 
                        padding: '0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: '#10b981',
                        border: 'none',
                        color: 'white',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={(e) => { e.stopPropagation(); setSelectedVault(vault); setShowDeposit(true); }}
                    >
                      <FiArrowDownCircle size={12} />
                    </button>
                    <button 
                      style={{ 
                        padding: '0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: '#f59e0b',
                        border: 'none',
                        color: 'white',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={(e) => { e.stopPropagation(); setSelectedVault(vault); setShowWithdraw(true); }}
                    >
                      <FiArrowUpCircle size={12} />
                    </button>
                    <button 
                      style={{ 
                        padding: '0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#64748b',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={(e) => { e.stopPropagation(); handleEditOpen(vault); }}
                    >
                      <FiEdit2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Keep all existing modals and logic here */}
      {/* ... existing modal code ... */}
    </div>
  );
}
