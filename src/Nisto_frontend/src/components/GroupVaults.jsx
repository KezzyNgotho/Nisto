import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { FiUsers, FiPlus, FiDollarSign, FiTarget, FiTrendingUp, FiCheck, FiX, FiLock, FiUnlock, FiEdit2, FiTrash2, FiUserPlus, FiEye, FiChevronDown, FiChevronUp, FiShield, FiArrowDownCircle, FiArrowUpCircle, FiList } from 'react-icons/fi';
import { AiFillCrown } from 'react-icons/ai';

export default function GroupVaults() {
  const {
    isAuthenticated, isLoading,
    getUserGroupVaults, createGroupVault, joinGroupVault,
    getVaultDetails, inviteVaultMember, toggleVaultPrivacy, removeVaultMember, changeVaultMemberRole, editGroupVault,
    depositToVault, withdrawFromVault, deleteGroupVault,
    user, principal
  } = useAuth();
  const { showToast } = useNotification();
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showTxHistory, setShowTxHistory] = useState(false);
  const [selectedVault, setSelectedVault] = useState(null);
  const [vaultDetails, setVaultDetails] = useState(null);
  const [inviteForm, setInviteForm] = useState({ userId: '', role: 'member' });
  const [editForm, setEditForm] = useState({});
  const [depositForm, setDepositForm] = useState({ amount: '', description: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', description: '' });
  const [newVault, setNewVault] = useState({ name: '', description: '', currency: '', targetAmount: '', isPublic: false });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [membersExpanded, setMembersExpanded] = useState({});

  useEffect(() => {
    const fetchVaults = async () => {
      setLoading(true);
      try {
        if (getUserGroupVaults) {
          const userVaults = await getUserGroupVaults();
          setVaults(userVaults || []);
        }
      } catch (err) {
        showToast({ message: 'Failed to load vaults', type: 'error', icon: <FiDollarSign /> });
      } finally {
        setLoading(false);
      }
    };
    fetchVaults();
    // eslint-disable-next-line
  }, []);

  const openVaultDetails = async (vault) => {
    setSelectedVault(vault);
    setShowMembers(true);
    try {
      const details = await getVaultDetails(vault.id);
      setVaultDetails(details);
    } catch (err) {
      showToast({ message: 'Failed to load vault details', type: 'error', icon: <FiDollarSign /> });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createGroupVault) return;
    if (!newVault.name || !newVault.currency) {
      setError('Name and currency are required');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createGroupVault(newVault.name, newVault.description, 'Savings', newVault.currency, newVault.targetAmount, newVault.isPublic, null);
      showToast({ message: 'Vault created!', type: 'success', icon: <FiCheck /> });
      setShowCreate(false);
      setNewVault({ name: '', description: '', currency: '', targetAmount: '', isPublic: false });
      if (getUserGroupVaults) {
        const userVaults = await getUserGroupVaults();
        setVaults(userVaults || []);
      }
    } catch (err) {
      setError('Failed to create vault');
      showToast({ message: 'Failed to create vault', type: 'error', icon: <FiDollarSign /> });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.currency) {
      setError('Name and currency are required');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await editGroupVault(selectedVault.id, editForm);
      showToast({ message: 'Vault updated!', type: 'success', icon: <FiCheck /> });
      setShowEdit(false);
      if (getUserGroupVaults) {
        const userVaults = await getUserGroupVaults();
        setVaults(userVaults || []);
      }
    } catch (err) {
      setError('Failed to update vault');
      showToast({ message: 'Failed to update vault', type: 'error', icon: <FiEdit2 /> });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await deleteGroupVault(selectedVault.id);
      showToast({ message: 'Vault deleted!', type: 'success', icon: <FiCheck /> });
      setShowDelete(false);
      setSelectedVault(null);
      if (getUserGroupVaults) {
        const userVaults = await getUserGroupVaults();
        setVaults(userVaults || []);
      }
    } catch (err) {
      setError('Failed to delete vault');
      showToast({ message: 'Failed to delete vault', type: 'error', icon: <FiTrash2 /> });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteForm.userId) return setError('User ID required');
    setSubmitting(true);
    setError(null);
    try {
      await inviteVaultMember(selectedVault.id, inviteForm.userId, inviteForm.role);
      showToast({ message: 'Invitation sent!', type: 'success', icon: <FiCheck /> });
      setShowInvite(false);
      setInviteForm({ userId: '', role: 'member' });
      // Refresh details
      const details = await getVaultDetails(selectedVault.id);
      setVaultDetails(details);
    } catch (err) {
      setError('Failed to invite');
      showToast({ message: 'Failed to invite', type: 'error', icon: <FiUserPlus /> });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositForm.amount || isNaN(depositForm.amount)) {
      setError('Enter a valid amount');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await depositToVault(selectedVault.id, depositForm.amount, depositForm.description);
      showToast({ message: 'Deposit successful!', type: 'success', icon: <FiArrowDownCircle /> });
      setShowDeposit(false);
      setDepositForm({ amount: '', description: '' });
      // Refresh vaults and details
      if (getUserGroupVaults) {
        const userVaults = await getUserGroupVaults();
        setVaults(userVaults || []);
      }
      if (getVaultDetails) {
        const details = await getVaultDetails(selectedVault.id);
        setVaultDetails(details);
      }
    } catch (err) {
      setError('Deposit failed');
      showToast({ message: 'Deposit failed', type: 'error', icon: <FiArrowDownCircle /> });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawForm.amount || isNaN(withdrawForm.amount)) {
      setError('Enter a valid amount');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await withdrawFromVault(selectedVault.id, withdrawForm.amount, withdrawForm.description);
      showToast({ message: 'Withdrawal successful!', type: 'success', icon: <FiArrowUpCircle /> });
      setShowWithdraw(false);
      setWithdrawForm({ amount: '', description: '' });
      // Refresh vaults and details
      if (getUserGroupVaults) {
        const userVaults = await getUserGroupVaults();
        setVaults(userVaults || []);
      }
      if (getVaultDetails) {
        const details = await getVaultDetails(selectedVault.id);
        setVaultDetails(details);
      }
    } catch (err) {
      setError('Withdrawal failed');
      showToast({ message: 'Withdrawal failed', type: 'error', icon: <FiArrowUpCircle /> });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePrivacy = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await toggleVaultPrivacy(selectedVault.id, !selectedVault.isPublic);
      showToast({ message: 'Privacy updated!', type: 'success', icon: <FiCheck /> });
      setShowPrivacy(false);
      // Refresh vaults
      if (getUserGroupVaults) {
        const userVaults = await getUserGroupVaults();
        setVaults(userVaults || []);
      }
    } catch (err) {
      setError('Failed to update privacy');
      showToast({ message: 'Failed to update privacy', type: 'error', icon: <FiLock /> });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    setSubmitting(true);
    setError(null);
    try {
      await removeVaultMember(selectedVault.id, memberId);
      showToast({ message: 'Member removed!', type: 'success', icon: <FiCheck /> });
      // Refresh details
      const details = await getVaultDetails(selectedVault.id);
      setVaultDetails(details);
    } catch (err) {
      setError('Failed to remove member');
      showToast({ message: 'Failed to remove member', type: 'error', icon: <FiTrash2 /> });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeRole = async (memberId, newRole) => {
    setSubmitting(true);
    setError(null);
    try {
      await changeVaultMemberRole(selectedVault.id, memberId, newRole);
      showToast({ message: 'Role updated!', type: 'success', icon: <FiCheck /> });
      // Refresh details
      const details = await getVaultDetails(selectedVault.id);
      setVaultDetails(details);
    } catch (err) {
      setError('Failed to change role');
      showToast({ message: 'Failed to change role', type: 'error', icon: <FiShield /> });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading group vaults...</div>;

  return (
    <div className="group-vaults-container">
      <div className="group-vaults-header">
        <FiUsers className="group-vaults-icon" />
        <h3>Group Vaults</h3>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}><FiPlus /> Create Vault</button>
      </div>
      {showCreate && (
        <div className="modal-overlay">
          <form className="create-vault-form" onSubmit={handleCreate} style={{ minWidth: 320, maxWidth: 420 }}>
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.08rem', color: 'var(--primary-700)', margin: 0 }}>Create Group Vault</h3>
              <button className="modal-close" type="button" onClick={() => setShowCreate(false)}><FiX /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label>Vault Name
                <input type="text" placeholder="Vault Name" value={newVault.name} onChange={e => setNewVault(v => ({ ...v, name: e.target.value }))} required />
              </label>
              <label>Description
                <input type="text" placeholder="Description" value={newVault.description} onChange={e => setNewVault(v => ({ ...v, description: e.target.value }))} />
              </label>
              <label>Currency
                <input type="text" placeholder="Currency (e.g. KES, USD)" value={newVault.currency} onChange={e => setNewVault(v => ({ ...v, currency: e.target.value }))} required />
              </label>
              <label>Target Amount
                <input type="number" placeholder="Target Amount (optional)" value={newVault.targetAmount} onChange={e => setNewVault(v => ({ ...v, targetAmount: e.target.value }))} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={newVault.isPublic} onChange={e => setNewVault(v => ({ ...v, isPublic: e.target.checked }))} /> Public Vault
              </label>
              {error && <div style={{ color: 'var(--error-600)', fontSize: 14 }}>{error}</div>}
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn btn-success" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}
      <div className="group-vaults-list">
        {vaults.length === 0 ? (
          <div>No group vaults found.</div>
        ) : vaults.map(vault => {
          const isOwner = user && (vault.ownerId && vault.ownerId.toString ? vault.ownerId.toString() : String(vault.ownerId)) === user.id;
          const isAdmin = vaultDetails && vaultDetails.members && vaultDetails.members.find(m => (m.userId && m.userId.toString ? m.userId.toString() : String(m.userId)) === user?.id && m.role === 'admin');
          const isMember = vault.members && vault.members.map(m => m && m.toString ? m.toString() : String(m)).includes(user?.id);
          const privacyIcon = vault.isPublic ? <FiUnlock style={{ color: 'var(--success-600)' }} /> : <FiLock style={{ color: 'var(--error-600)' }} />;
          const privacyLabel = vault.isPublic ? 'Public' : 'Private';
          const progress = vault.targetAmount ? Math.min(100, (vault.totalBalance / vault.targetAmount) * 100) : null;
          return (
            <div key={vault.id} className="group-vault-card creative-card">
              <div className="vault-card-header">
                <span className="vault-title">{vault.name}</span>
                <span className="vault-privacy-badge">{privacyIcon} {privacyLabel}</span>
              </div>
              <div className="vault-desc">{vault.description}</div>
              <div className="vault-meta">
                <span><FiDollarSign /> {vault.currency}</span>
                <span><FiTarget /> Target: {vault.targetAmount || 'N/A'}</span>
                <span><FiTrendingUp /> Balance: {vault.totalBalance}</span>
                <span><FiUsers /> Members: {vault.members ? vault.members.length : '—'}</span>
                {isOwner && <span className="vault-owner-badge"><AiFillCrown /> Owner</span>}
              </div>
              {progress !== null && (
                <div className="vault-progress-bar" style={{ width: '100%', background: 'var(--neutral-100)', borderRadius: 6, height: 8, margin: '8px 0' }}>
                  <div style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--primary-400), var(--primary-700))', height: '100%', borderRadius: 6, transition: 'width 0.4s' }} />
                </div>
              )}
              <div className="vault-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => openVaultDetails(vault)}><FiEye /> View</button>
                <button className="btn btn-outline btn-sm" onClick={() => { setSelectedVault(vault); setShowTxHistory(true); }}><FiList /> History</button>
                {(isOwner || isAdmin) && (
                  <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedVault(vault); setEditForm({ ...vault }); setShowEdit(true); }}><FiEdit2 /> Edit</button>
                )}
                {(isOwner || isAdmin) && (
                  <button className="btn btn-danger btn-sm" onClick={() => { setSelectedVault(vault); setShowDelete(true); }}><FiTrash2 /> Delete</button>
                )}
                {isOwner && (
                  <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedVault(vault); setShowInvite(true); }}><FiUserPlus /> Invite</button>
                )}
                {isOwner && (
                  <button className="btn btn-outline btn-sm" onClick={() => { setSelectedVault(vault); setShowPrivacy(true); }}>{vault.isPublic ? <FiLock /> : <FiUnlock />} {vault.isPublic ? 'Make Private' : 'Make Public'}</button>
                )}
                {(isMember || isOwner || isAdmin) && (
                  <button className="btn btn-success btn-sm" onClick={() => { setSelectedVault(vault); setShowDeposit(true); }}><FiArrowDownCircle /> Deposit</button>
                )}
                {(isMember || isOwner || isAdmin) && (
                  <button className="btn btn-warning btn-sm" onClick={() => { setSelectedVault(vault); setShowWithdraw(true); }}><FiArrowUpCircle /> Withdraw</button>
                )}
                {vault.isPublic && joinGroupVault && (
                  <button className="btn btn-primary btn-sm" onClick={() => joinGroupVault(vault.id)}><FiUsers /> Join</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Invite Modal */}
      {showInvite && selectedVault && (
        <div className="modal-overlay">
          <form className="modal" style={{ minWidth: 320, maxWidth: 400 }} onSubmit={handleInvite}>
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.08rem', color: 'var(--primary-700)', margin: 0 }}>Invite Member</h3>
              <button className="modal-close" type="button" onClick={() => setShowInvite(false)}><FiX /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label>User Principal/ID
                <input type="text" placeholder="Principal or User ID" value={inviteForm.userId} onChange={e => setInviteForm(f => ({ ...f, userId: e.target.value }))} required />
              </label>
              <label>Role
                <select value={inviteForm.role} onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              {error && <div style={{ color: 'var(--error-600)', fontSize: 14 }}>{error}</div>}
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowInvite(false)}>Cancel</button>
              <button type="submit" className="btn btn-success" disabled={submitting}>{submitting ? 'Inviting...' : 'Invite'}</button>
            </div>
          </form>
        </div>
      )}
      {/* Members Modal */}
      {showMembers && selectedVault && vaultDetails && (
        <div className="modal-overlay">
          <div className="modal" style={{ minWidth: 340, maxWidth: 520 }}>
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.08rem', color: 'var(--primary-700)', margin: 0 }}>Vault Members</h3>
              <button className="modal-close" type="button" onClick={() => setShowMembers(false)}><FiX /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 320, overflowY: 'auto' }}>
              {vaultDetails.members.map(member => (
                <div key={member.id} className="vault-member-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 8, borderRadius: 6, background: 'var(--neutral-50)' }}>
                  <span style={{ fontWeight: 600 }}>{member.userId === vaultDetails.vault.ownerId ? <AiFillCrown /> : <FiUsers />} {member.role}</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--primary-700)' }}>{member.userId && member.userId.toString ? member.userId.toString() : String(member.userId)}</span>
                  <span style={{ fontSize: 12, color: 'var(--neutral-600)' }}>Joined: {new Date(Number(member.joinedAt)).toLocaleDateString()}</span>
                  {user && user.id === vaultDetails.vault.ownerId && member.role !== 'owner' && (
                    <>
                      <button className="btn btn-outline btn-xs" onClick={() => handleChangeRole(member.id, member.role === 'admin' ? 'member' : 'admin')}>{member.role === 'admin' ? 'Demote' : 'Promote'}</button>
                      <button className="btn btn-danger btn-xs" onClick={() => handleRemoveMember(member.id)}><FiTrash2 /></button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Privacy Modal */}
      {showPrivacy && selectedVault && (
        <div className="modal-overlay">
          <div className="modal" style={{ minWidth: 320, maxWidth: 400 }}>
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.08rem', color: 'var(--primary-700)', margin: 0 }}>Change Vault Privacy</h3>
              <button className="modal-close" type="button" onClick={() => setShowPrivacy(false)}><FiX /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>Current: <b>{selectedVault.isPublic ? 'Public' : 'Private'}</b></div>
              <div>Are you sure you want to make this vault <b>{selectedVault.isPublic ? 'Private' : 'Public'}</b>?</div>
              {error && <div style={{ color: 'var(--error-600)', fontSize: 14 }}>{error}</div>}
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowPrivacy(false)}>Cancel</button>
              <button type="button" className="btn btn-success" disabled={submitting} onClick={handleTogglePrivacy}>{submitting ? 'Updating...' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {showEdit && selectedVault && (
        <div className="modal-overlay">
          <form className="modal" style={{ minWidth: 320, maxWidth: 420 }} onSubmit={handleEdit}>
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.08rem', color: 'var(--primary-700)', margin: 0 }}>Edit Vault</h3>
              <button className="modal-close" type="button" onClick={() => setShowEdit(false)}><FiX /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label>Name
                <input type="text" value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required />
              </label>
              <label>Description
                <input type="text" value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
              </label>
              <label>Currency
                <input type="text" value={editForm.currency || ''} onChange={e => setEditForm(f => ({ ...f, currency: e.target.value }))} required />
              </label>
              <label>Target Amount
                <input type="number" value={editForm.targetAmount || ''} onChange={e => setEditForm(f => ({ ...f, targetAmount: e.target.value }))} />
              </label>
              {error && <div style={{ color: 'var(--error-600)', fontSize: 14 }}>{error}</div>}
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
              <button type="submit" className="btn btn-success" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
      {/* Delete Modal */}
      {showDelete && selectedVault && (
        <div className="modal-overlay">
          <div className="modal" style={{ minWidth: 320, maxWidth: 400 }}>
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.08rem', color: 'var(--error-700)', margin: 0 }}>Delete Vault</h3>
              <button className="modal-close" type="button" onClick={() => setShowDelete(false)}><FiX /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>Are you sure you want to <b>delete</b> this vault? This action cannot be undone.</div>
              {error && <div style={{ color: 'var(--error-600)', fontSize: 14 }}>{error}</div>}
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowDelete(false)}>Cancel</button>
              <button type="button" className="btn btn-danger" disabled={submitting} onClick={handleDelete}>{submitting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Deposit Modal */}
      {showDeposit && selectedVault && (
        <div className="modal-overlay">
          <form className="modal" style={{ minWidth: 320, maxWidth: 400 }} onSubmit={handleDeposit}>
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.08rem', color: 'var(--primary-700)', margin: 0 }}>Deposit to Vault</h3>
              <button className="modal-close" type="button" onClick={() => setShowDeposit(false)}><FiX /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label>Amount
                <input type="number" value={depositForm.amount} onChange={e => setDepositForm(f => ({ ...f, amount: e.target.value }))} required min="0.01" step="0.01" />
              </label>
              <label>Description
                <input type="text" value={depositForm.description} onChange={e => setDepositForm(f => ({ ...f, description: e.target.value }))} placeholder="(optional)" />
              </label>
              {error && <div style={{ color: 'var(--error-600)', fontSize: 14 }}>{error}</div>}
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeposit(false)}>Cancel</button>
              <button type="submit" className="btn btn-success" disabled={submitting}>{submitting ? 'Depositing...' : 'Deposit'}</button>
            </div>
          </form>
        </div>
      )}
      {/* Withdraw Modal */}
      {showWithdraw && selectedVault && (
        <div className="modal-overlay">
          <form className="modal" style={{ minWidth: 320, maxWidth: 400 }} onSubmit={handleWithdraw}>
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.08rem', color: 'var(--primary-700)', margin: 0 }}>Withdraw from Vault</h3>
              <button className="modal-close" type="button" onClick={() => setShowWithdraw(false)}><FiX /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label>Amount
                <input type="number" value={withdrawForm.amount} onChange={e => setWithdrawForm(f => ({ ...f, amount: e.target.value }))} required min="0.01" step="0.01" />
              </label>
              <label>Description
                <input type="text" value={withdrawForm.description} onChange={e => setWithdrawForm(f => ({ ...f, description: e.target.value }))} placeholder="(optional)" />
              </label>
              {error && <div style={{ color: 'var(--error-600)', fontSize: 14 }}>{error}</div>}
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowWithdraw(false)}>Cancel</button>
              <button type="submit" className="btn btn-warning" disabled={submitting}>{submitting ? 'Withdrawing...' : 'Withdraw'}</button>
            </div>
          </form>
        </div>
      )}
      {/* Transaction History Modal */}
      {showTxHistory && selectedVault && vaultDetails && (
        <div className="modal-overlay">
          <div className="modal" style={{ minWidth: 340, maxWidth: 600 }}>
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.08rem', color: 'var(--primary-700)', margin: 0 }}>Vault Transactions</h3>
              <button className="modal-close" type="button" onClick={() => setShowTxHistory(false)}><FiX /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: 340, overflowY: 'auto' }}>
              {vaultDetails.transactions && vaultDetails.transactions.length > 0 ? (
                <table className="vault-tx-table" style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--neutral-100)' }}>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Currency</th>
                      <th>Description</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaultDetails.transactions.map(tx => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                        <td>{new Date(Number(tx.timestamp)).toLocaleDateString()}</td>
                        <td>{tx.type_}</td>
                        <td style={{ color: tx.type_ === 'deposit' ? 'var(--success-700)' : 'var(--error-700)' }}>{tx.type_ === 'deposit' ? '+' : '-'}{tx.amount}</td>
                        <td>{tx.currency}</td>
                        <td>{tx.description}</td>
                        <td>{tx.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ color: 'var(--neutral-500)', textAlign: 'center', marginTop: 24 }}>No transactions yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 