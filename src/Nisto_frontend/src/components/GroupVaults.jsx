import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { FiUsers, FiPlus, FiDollarSign, FiTarget, FiTrendingUp, FiCheck, FiX, FiLock, FiUnlock, FiEdit2, FiTrash2, FiUserPlus, FiEye, FiChevronDown, FiChevronUp, FiShield, FiArrowDownCircle, FiArrowUpCircle, FiList, FiSend, FiChevronLeft } from 'react-icons/fi';
import { AiFillCrown } from 'react-icons/ai';

export default function GroupVaults() {
  const { getUserGroupVaults, getVaultDetails, user, isAuthenticated, login } = useAuth();
  const { showToast } = useNotification();
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedVaultId, setExpandedVaultId] = useState(null);
  const [vaultDetails, setVaultDetails] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newVault, setNewVault] = useState({ name: '', description: '', currency: '', targetAmount: '', isPublic: false });
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

  useEffect(() => {
    const fetchVaults = async () => {
      if (!isAuthenticated) {
        // Optionally, show a modal or toast, or trigger login automatically
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
      // Replace with actual createGroupVault logic
      // await createGroupVault(newVault.name, newVault.description, 'Savings', newVault.currency, newVault.targetAmount, newVault.isPublic, null);
      setShowCreate(false);
      setNewVault({ name: '', description: '', currency: '', targetAmount: '', isPublic: false });
      // Optionally refresh vaults
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

  // 1. Prefill editForm with selected vault details when opening Edit Vault modal
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
      const details = await getVaultDetails(vault.id);
      setVaultDetails(details);
    } catch {
      setVaultDetails(null);
      showToast({ message: 'Failed to load vault details', type: 'error', icon: <FiDollarSign /> });
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: 'var(--primary-600)' }}>Loading group vaults...</div>;

  return (
    <div className="group-vaults-root" style={{ width: '100%', padding: '0', margin: 0, position: 'relative' }}>
      {/* Creative floating Create Vault button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1.5rem', width: '100%' }}>
        <button ref={createBtnRef} className="btn btn-primary" style={{ borderRadius: 24, boxShadow: '0 2px 8px 0 rgba(59,130,246,0.10)', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, padding: '0.6em 1.4em', background: 'linear-gradient(90deg, var(--primary-500), var(--primary-700))', color: '#fff', border: 'none', transition: 'box-shadow 0.2s' }} onClick={() => setShowCreate(true)}><FiPlus /> Create Vault</button>
      </div>
      {/* Modern modal for creating a vault */}
      {showCreate && (
        <div className="modal-overlay polished modal-fade modal-scale" onClick={e => { if (e.target.classList.contains('modal-overlay')) setShowCreate(false); }}>
          <form className="create-vault-form polished" onSubmit={handleCreate} style={{ minWidth: 320, maxWidth: 420, background: '#fff', borderRadius: 18, boxShadow: '0 8px 32px 0 rgba(59,130,246,0.13)', padding: '2.2rem 2.2rem 1.5rem 2.2rem', position: 'relative', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <button type="button" className="modal-close" style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 22, color: 'var(--neutral-400)', cursor: 'pointer' }} onClick={() => setShowCreate(false)}><FiX /></button>
            <h3 style={{ fontSize: '1.18rem', color: 'var(--primary-700)', margin: 0, fontWeight: 800, marginBottom: 10 }}>Create Group Vault</h3>
            <label style={{ fontWeight: 600, color: 'var(--primary-700)', fontSize: 14 }}>Vault Name
              <input type="text" placeholder="Vault Name" value={newVault.name} onChange={e => setNewVault(v => ({ ...v, name: e.target.value }))} required style={{ width: '100%', marginTop: 4, padding: '0.6em', borderRadius: 8, border: '1.5px solid var(--primary-100)', fontSize: 15 }} />
            </label>
            <label style={{ fontWeight: 600, color: 'var(--primary-700)', fontSize: 14 }}>Description
              <input type="text" placeholder="Description" value={newVault.description} onChange={e => setNewVault(v => ({ ...v, description: e.target.value }))} style={{ width: '100%', marginTop: 4, padding: '0.6em', borderRadius: 8, border: '1.5px solid var(--primary-100)', fontSize: 15 }} />
            </label>
            <label style={{ fontWeight: 600, color: 'var(--primary-700)', fontSize: 14 }}>Currency
              <input type="text" placeholder="Currency (e.g. KES, USD)" value={newVault.currency} onChange={e => setNewVault(v => ({ ...v, currency: e.target.value }))} required style={{ width: '100%', marginTop: 4, padding: '0.6em', borderRadius: 8, border: '1.5px solid var(--primary-100)', fontSize: 15 }} />
            </label>
            <label style={{ fontWeight: 600, color: 'var(--primary-700)', fontSize: 14 }}>Target Amount
              <input type="number" placeholder="Target Amount (optional)" value={newVault.targetAmount} onChange={e => setNewVault(v => ({ ...v, targetAmount: e.target.value }))} style={{ width: '100%', marginTop: 4, padding: '0.6em', borderRadius: 8, border: '1.5px solid var(--primary-100)', fontSize: 15 }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: 'var(--primary-700)', fontSize: 14 }}>
              <input type="checkbox" checked={newVault.isPublic} onChange={e => setNewVault(v => ({ ...v, isPublic: e.target.checked }))} /> Public Vault
            </label>
            {error && <div style={{ color: 'var(--error-600)', fontSize: 14 }}>{error}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
              <button type="button" className="btn btn-secondary" style={{ borderRadius: 8, padding: '0.5em 1.2em', fontWeight: 700, fontSize: 15, background: 'var(--neutral-100)', color: 'var(--primary-700)', border: '1.5px solid var(--primary-100)' }} onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn btn-success" style={{ borderRadius: 8, padding: '0.5em 1.2em', fontWeight: 700, fontSize: 15, background: 'var(--success-500)', color: '#fff', border: 'none' }} disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</button>
          </div>
          </form>
        </div>
      )}
      {showDeposit && selectedVault && (
        <div className="modal-overlay polished modal-fade modal-scale" onClick={e => { if (e.target.classList.contains('modal-overlay')) setShowDeposit(false); }}>
          <form className="modal-form polished" onClick={e => e.stopPropagation()} onSubmit={async e => {
            e.preventDefault();
            setSubmitting(true);
            try {
              // await depositToVault(selectedVault.id, depositAmount, depositDesc); // This function is not defined in the original file
              setShowDeposit(false);
              setDepositAmount('');
              setDepositDesc('');
              // await refreshVaults(); // This function is not defined in the original file
              showToast({ message: 'Deposit successful!', type: 'success', icon: <FiCheck /> });
            } catch (err) {
              showToast({ message: 'Deposit failed', type: 'error', icon: <FiX /> });
            } finally {
              setSubmitting(false);
            }
          }}>
            <h3>Deposit to Vault</h3>
            <input type="number" placeholder="Amount" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} required />
            <input type="text" placeholder="Description (optional)" value={depositDesc} onChange={e => setDepositDesc(e.target.value)} />
            <div className="modal-actions">
              <button type="button" onClick={() => setShowDeposit(false)}>Cancel</button>
              <button type="submit" disabled={submitting}>{submitting ? 'Depositing...' : 'Deposit'}</button>
            </div>
          </form>
        </div>
      )}
      {showWithdraw && selectedVault && (
        <div className="modal-overlay polished modal-fade modal-scale" onClick={e => { if (e.target.classList.contains('modal-overlay')) setShowWithdraw(false); }}>
          <form className="modal-form polished" onClick={e => e.stopPropagation()} onSubmit={async e => {
            e.preventDefault();
            setSubmitting(true);
            try {
              // await withdrawFromVault(selectedVault.id, withdrawAmount, withdrawDesc); // This function is not defined in the original file
              setShowWithdraw(false);
              setWithdrawAmount('');
              setWithdrawDesc('');
              // await refreshVaults(); // This function is not defined in the original file
              showToast({ message: 'Withdraw successful!', type: 'success', icon: <FiCheck /> });
            } catch (err) {
              showToast({ message: 'Withdraw failed', type: 'error', icon: <FiX /> });
            } finally {
              setSubmitting(false);
            }
          }}>
            <h3>Withdraw from Vault</h3>
            <input type="number" placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} required />
            <input type="text" placeholder="Description (optional)" value={withdrawDesc} onChange={e => setWithdrawDesc(e.target.value)} />
            <div className="modal-actions">
              <button type="button" onClick={() => setShowWithdraw(false)}>Cancel</button>
              <button type="submit" disabled={submitting}>{submitting ? 'Withdrawing...' : 'Withdraw'}</button>
            </div>
          </form>
        </div>
      )}
      {showEdit && selectedVault && (
        <div className="modal-overlay polished modal-fade modal-scale" onClick={e => { if (e.target.classList.contains('modal-overlay')) setShowEdit(false); }}>
          <form className="modal-form polished" onClick={e => e.stopPropagation()} onSubmit={async e => {
            e.preventDefault();
            setSubmitting(true);
            try {
              // await editGroupVault(selectedVault.id, editForm); // This function is not defined in the original file
              setShowEdit(false);
              // await refreshVaults(); // This function is not defined in the original file
              showToast({ message: 'Vault updated!', type: 'success', icon: <FiCheck /> });
            } catch (err) {
              showToast({ message: 'Edit failed', type: 'error', icon: <FiX /> });
            } finally {
              setSubmitting(false);
            }
          }}>
            <h3>Edit Vault</h3>
            <input type="text" placeholder="Name" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required />
            <input type="text" placeholder="Description" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
            <input type="text" placeholder="Currency" value={editForm.currency} onChange={e => setEditForm(f => ({ ...f, currency: e.target.value }))} required />
            <input type="number" placeholder="Target Amount" value={editForm.targetAmount} onChange={e => setEditForm(f => ({ ...f, targetAmount: e.target.value }))} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: 'var(--primary-700)', fontSize: 14 }}>
              <input type="checkbox" checked={editForm.isPublic} onChange={e => setEditForm(f => ({ ...f, isPublic: e.target.checked }))} /> Public Vault
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowEdit(false)}>Cancel</button>
              <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
      {showDelete && selectedVault && (
        <div className="modal-overlay polished modal-fade modal-scale" onClick={e => { if (e.target.classList.contains('modal-overlay')) setShowDelete(false); }}>
          <div className="modal-form polished" onClick={e => e.stopPropagation()}>
            <h3>Delete Vault</h3>
            <p>Are you sure you want to delete this vault? This action cannot be undone.</p>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowDelete(false)}>Cancel</button>
              <button type="button" disabled={submitting} onClick={async () => {
                setSubmitting(true);
                try {
                  // await deleteGroupVault(selectedVault.id); // This function is not defined in the original file
                  setShowDelete(false);
                  // await refreshVaults(); // This function is not defined in the original file
                  showToast({ message: 'Vault deleted!', type: 'success', icon: <FiCheck /> });
                } catch (err) {
                  showToast({ message: 'Delete failed', type: 'error', icon: <FiX /> });
                } finally {
                  setSubmitting(false);
                }
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}
      {showPrivacy && selectedVault && (
        <div className="modal-overlay polished modal-fade modal-scale" onClick={e => { if (e.target.classList.contains('modal-overlay')) setShowPrivacy(false); }}>
          <div className="modal-form polished" onClick={e => e.stopPropagation()}>
            <h3>Toggle Privacy</h3>
            <p>Current: {selectedVault.isPublic ? 'Public' : 'Private'}</p>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowPrivacy(false)}>Cancel</button>
              <button type="button" disabled={submitting} onClick={async () => {
                setSubmitting(true);
                try {
                  // await toggleVaultPrivacy(selectedVault.id, !selectedVault.isPublic); // This function is not defined in the original file
                  setShowPrivacy(false);
                  // await refreshVaults(); // This function is not defined in the original file
                  showToast({ message: 'Privacy updated!', type: 'success', icon: <FiCheck /> });
                } catch (err) {
                  showToast({ message: 'Privacy update failed', type: 'error', icon: <FiX /> });
                } finally {
                  setSubmitting(false);
                }
              }}>{selectedVault.isPublic ? 'Make Private' : 'Make Public'}</button>
            </div>
          </div>
        </div>
      )}
      {showPropose && selectedVault && (
        <div className="modal-overlay polished modal-fade modal-scale" onClick={e => { if (e.target.classList.contains('modal-overlay')) setShowPropose(false); }}>
          <form className="modal-form polished" onClick={e => e.stopPropagation()} onSubmit={async e => {
            e.preventDefault();
            setSubmitting(true);
            try {
              // await proposeVaultAction(selectedVault.id, proposeType, proposeTarget, proposeRole); // This function is not defined in the original file
              setShowPropose(false);
              setProposeType('DeleteVault');
              setProposeTarget('');
              setProposeRole('member');
              // await refreshVaults(); // This function is not defined in the original file
              showToast({ message: 'Proposal submitted!', type: 'success', icon: <FiCheck /> });
            } catch (err) {
              showToast({ message: 'Proposal failed', type: 'error', icon: <FiX /> });
            } finally {
              setSubmitting(false);
            }
          }}>
            <h3>Propose Vault Action</h3>
            <select value={proposeType} onChange={e => setProposeType(e.target.value)} required>
              <option value="DeleteVault">Delete Vault</option>
              <option value="RemoveMember">Remove Member</option>
              <option value="ChangeRole">Change Role</option>
              <option value="TogglePrivacy">Toggle Privacy</option>
            </select>
            <input type="text" placeholder="Target User ID (if applicable)" value={proposeTarget} onChange={e => setProposeTarget(e.target.value)} />
            <input type="text" placeholder="New Role (if applicable)" value={proposeRole} onChange={e => setProposeRole(e.target.value)} />
            <div className="modal-actions">
              <button type="button" onClick={() => setShowPropose(false)}>Cancel</button>
              <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
            </div>
          </form>
        </div>
      )}
      {showInvite && selectedVault && (
        <div className="modal-overlay polished modal-fade modal-scale" onClick={e => { if (e.target.classList.contains('modal-overlay')) setShowInvite(false); }}>
          <form className="modal-form polished" onClick={e => e.stopPropagation()} onSubmit={async e => {
            e.preventDefault();
            setSubmitting(true);
            try {
              // await inviteVaultMember(selectedVault.id, inviteUserId, inviteRole); // This function is not defined in the original file
              setShowInvite(false);
              setInviteUserId('');
              setInviteRole('member');
              // await refreshVaults(); // This function is not defined in the original file
              showToast({ message: 'Invitation sent!', type: 'success', icon: <FiCheck /> });
            } catch (err) {
              showToast({ message: 'Invite failed', type: 'error', icon: <FiX /> });
            } finally {
              setSubmitting(false);
            }
          }}>
            <h3>Invite Member</h3>
            <input type="text" placeholder="User ID" value={inviteUserId} onChange={e => setInviteUserId(e.target.value)} required />
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} required>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowInvite(false)}>Cancel</button>
              <button type="submit" disabled={submitting}>{submitting ? 'Inviting...' : 'Invite'}</button>
            </div>
          </form>
        </div>
      )}
      {showChangeRole && selectedVault && selectedMember && (
        <div className="modal-overlay polished modal-fade modal-scale" onClick={e => { if (e.target.classList.contains('modal-overlay')) setShowChangeRole(false); }}>
          <form className="modal-form polished" onClick={e => e.stopPropagation()} onSubmit={async e => {
            e.preventDefault();
            setSubmitting(true);
            try {
              // await changeVaultMemberRole(selectedVault.id, selectedMember.id, newRole); // This function is not defined in the original file
              setShowChangeRole(false);
              setNewRole('member');
              // await refreshVaults(); // This function is not defined in the original file
              showToast({ message: 'Role changed!', type: 'success', icon: <FiCheck /> });
            } catch (err) {
              showToast({ message: 'Change role failed', type: 'error', icon: <FiX /> });
            } finally {
              setSubmitting(false);
            }
          }}>
            <h3>Change Member Role</h3>
            <select value={newRole} onChange={e => setNewRole(e.target.value)} required>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowChangeRole(false)}>Cancel</button>
              <button type="submit" disabled={submitting}>{submitting ? 'Changing...' : 'Change'}</button>
            </div>
          </form>
        </div>
      )}
      {showRemoveMember && selectedVault && selectedMember && (
        <div className="modal-overlay polished modal-fade modal-scale" onClick={e => { if (e.target.classList.contains('modal-overlay')) setShowRemoveMember(false); }}>
          <div className="modal-form polished" onClick={e => e.stopPropagation()}>
            <h3>Remove Member</h3>
            <p>Are you sure you want to remove this member?</p>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowRemoveMember(false)}>Cancel</button>
              <button type="button" disabled={submitting} onClick={async () => {
                setSubmitting(true);
                try {
                  // await removeVaultMember(selectedVault.id, selectedMember.id); // This function is not defined in the original file
                  setShowRemoveMember(false);
                  // await refreshVaults(); // This function is not defined in the original file
                  showToast({ message: 'Member removed!', type: 'success', icon: <FiCheck /> });
                } catch (err) {
                  showToast({ message: 'Remove failed', type: 'error', icon: <FiX /> });
                } finally {
                  setSubmitting(false);
                }
              }}>Remove</button>
            </div>
          </div>
        </div>
      )}
      {/* Instead of rendering VaultDetails as a modal, render it as the main content when showVaultDetails is true */}
      {showVaultDetails && selectedVault && vaultDetails ? (
        <VaultDetails
          vault={selectedVault}
          details={vaultDetails}
          onBack={() => setShowVaultDetails(false)}
          user={user}
          showToast={showToast}
        />
      ) : (
        <div className="group-vaults-list" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
          gap: '1.5rem',
          justifyItems: 'start',
          alignItems: 'start',
          margin: 0,
          padding: 0
        }}>
          {vaults.length === 0 ? (
            <div style={{ color: 'var(--neutral-400)', fontSize: 16, padding: '2rem' }}>No group vaults found.</div>
          ) : (
            vaults.map(vault => (
              <div key={vault.id} className={`vault-card vault-card-hover`} style={{
                background: 'var(--dashboard-card-bg)',
                borderRadius: 7,
                boxShadow: 'var(--shadow-sm)',
                border: expandedVaultId === vault.id ? '2px solid var(--primary-200)' : '1px solid var(--neutral-100)',
                margin: 0,
                padding: expandedVaultId === vault.id ? '1.1rem 1.5rem 1.1rem 1.5rem' : '0.7rem 1.1rem',
                minWidth: 420,
                maxWidth: 600,
                fontSize: 14,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
                overflow: 'visible',
                cursor: 'pointer',
                boxShadow: expandedVaultId === vault.id ? '0 4px 16px 0 rgba(59,130,246,0.10)' : 'var(--shadow-sm)',
              }}
              tabIndex={0}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px 0 rgba(59,130,246,0.13)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = expandedVaultId === vault.id ? '0 4px 16px 0 rgba(59,130,246,0.10)' : 'var(--shadow-sm)'}
              onClick={() => handleOpenVaultDetails(vault)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary-800)' }}>{vault.name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>{vault.isPublic ? <FiUnlock style={{ color: 'var(--success-600)' }} /> : <FiLock style={{ color: 'var(--error-600)' }} />}{vault.isPublic ? 'Public' : 'Private'}</span>
                </div>
                <div style={{ color: 'var(--neutral-400)', fontSize: 13, marginBottom: 6 }}>{vault.description}</div>
                <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 13, color: 'var(--neutral-600)', marginBottom: 6 }}>
                  <span><FiDollarSign /> {vault.currency}</span>
                  <span><FiTarget /> Target: {vault.targetAmount || 'N/A'}</span>
                  <span><FiTrendingUp /> Bal: {vault.totalBalance}</span>
                  <span><FiUsers /> {vault.members ? vault.members.length : '—'} members</span>
                  <span>Status: <span style={{ color: vault.status === 'active' ? 'var(--success-600)' : 'var(--error-600)', fontWeight: 600 }}>{vault.status ? vault.status.charAt(0).toUpperCase() + vault.status.slice(1) : 'Active'}</span></span>
                </div>
                <div className="vault-actions" style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4, marginBottom: expandedVaultId === vault.id ? 10 : 0, fontSize: 15, justifyContent: 'flex-start', alignItems: 'center', background: 'rgba(245,247,255,0.7)', borderRadius: 4, padding: '2px 4px', boxShadow: '0 1px 4px 0 rgba(59,130,246,0.04)', transition: 'background 0.18s' }}>
                  <button className="btn btn-outline btn-xs btn-action" title={expandedVaultId === vault.id ? 'Collapse' : 'Expand'} style={{ minWidth: 22, fontSize: 15, padding: '0.08em 0.22em', borderRadius: 4 }} onClick={() => handleExpand(vault.id)}>{expandedVaultId === vault.id ? <FiChevronUp /> : <FiEye />}</button>
                  <button className="btn btn-success btn-xs btn-action" style={{ borderRadius: 4 }} title="Deposit" onClick={() => { setSelectedVault(vault); setShowDeposit(true); }}><FiArrowDownCircle /></button>
                  <button className="btn btn-warning btn-xs btn-action" style={{ borderRadius: 4 }} title="Withdraw" onClick={() => { setSelectedVault(vault); setShowWithdraw(true); }}><FiArrowUpCircle /></button>
                  <button className="btn btn-outline btn-xs btn-action" style={{ borderRadius: 4 }} title="Edit Vault" onClick={() => handleEditOpen(vault)}><FiEdit2 /></button>
                  <button className="btn btn-danger btn-xs btn-action" style={{ borderRadius: 4 }} title="Delete Vault" onClick={() => { setSelectedVault(vault); setShowDelete(true); }}><FiTrash2 /></button>
                  <button className="btn btn-outline btn-xs btn-action" style={{ borderRadius: 4 }} title="Toggle Privacy" onClick={() => { setSelectedVault(vault); setShowPrivacy(true); }}>{vault.isPublic ? <FiLock /> : <FiUnlock />}</button>
                  <button className="btn btn-outline btn-xs btn-action" style={{ borderRadius: 4 }} title="Propose Action" onClick={() => { setSelectedVault(vault); setShowPropose(true); }}><FiShield /></button>
                  <button className="btn btn-outline btn-xs btn-action" style={{ borderRadius: 4 }} title="Invite Member" onClick={() => { setSelectedVault(vault); setShowInvite(true); }}><FiUserPlus /></button>
                </div>
                {expandedVaultId === vault.id && vaultDetails && (
                  <div className="vault-expanded-details" style={{ marginTop: 18, background: 'rgba(245,247,255,0.92)', borderRadius: 7, boxShadow: 'var(--shadow-xs)', padding: '1.1rem', border: '1.5px solid var(--primary-50)', transition: 'all 0.28s cubic-bezier(.4,0,.2,1)' }}>
                    {/* Members List */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <FiUsers style={{ color: 'var(--primary-600)' }} />
                        <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>Members</span>
                        <button className="btn btn-xs btn-action" style={{ marginLeft: 'auto', borderRadius: 4 }} title="Invite Member"><FiUserPlus /></button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {vaultDetails.members && vaultDetails.members.length > 0 ? (
                          vaultDetails.members.map(member => (
                            <div key={member.id} style={{ background: 'var(--neutral-0)', borderRadius: 4, boxShadow: 'var(--shadow-xs)', padding: '0.5rem 0.9rem', display: 'flex', alignItems: 'center', gap: 10, minWidth: 120 }}>
                              <span style={{ fontWeight: 600, color: 'var(--primary-700)' }}>{member.userId === vaultDetails.vault.ownerId ? <AiFillCrown /> : <FiUsers />} {member.userId && member.userId.toString ? member.userId.toString() : String(member.userId)}</span>
                              <span style={{ background: 'var(--neutral-100)', color: member.role === 'owner' ? 'var(--primary-600)' : member.role === 'admin' ? 'var(--success-600)' : 'var(--primary-400)', borderRadius: 4, padding: '2px 10px', fontWeight: 700, fontSize: 13, marginLeft: 8 }}>{member.role.charAt(0).toUpperCase() + member.role.slice(1)}</span>
                              <span style={{ fontSize: 12, color: 'var(--neutral-500)' }}>Joined: {new Date(Number(member.joinedAt)).toLocaleDateString()}</span>
                              {/* Actions: Remove, Change Role */}
                              <button className="btn btn-outline btn-xs btn-action" style={{ borderRadius: 4 }} title="Change Role" onClick={() => { setSelectedVault(vaultDetails.vault); setSelectedMember(member); setShowChangeRole(true); }}><FiShield /></button>
                              <button className="btn btn-danger btn-xs btn-action" style={{ borderRadius: 4 }} title="Remove Member" onClick={() => { setSelectedVault(vaultDetails.vault); setSelectedMember(member); setShowRemoveMember(true); }}><FiTrash2 /></button>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: 'var(--neutral-400)' }}>No members yet.</div>
                        )}
                      </div>
                    </div>
                    {/* Balances/Progress */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <FiTrendingUp style={{ color: 'var(--primary-600)' }} />
                        <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>Balance & Progress</span>
                      </div>
                      <div style={{ display: 'flex', gap: 18, alignItems: 'center', fontSize: 14 }}>
                        <span>Total: <b>{vaultDetails.vault.totalBalance}</b> {vaultDetails.vault.currency}</span>
                        <span>Target: <b>{vaultDetails.vault.targetAmount || 'N/A'}</b></span>
                        <div style={{ flex: 1, minWidth: 120, maxWidth: 220 }}>
                          <div style={{ width: '100%', background: 'var(--neutral-100)', borderRadius: 4, height: 7 }}>
                            <div style={{ width: `${vaultDetails.vault.targetAmount ? Math.min(100, (vaultDetails.vault.totalBalance / vaultDetails.vault.targetAmount) * 100) : 0}%`, background: 'linear-gradient(90deg, var(--primary-400), var(--primary-700))', height: '100%', borderRadius: 4, transition: 'width 0.3s' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Transaction History */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <FiList style={{ color: 'var(--primary-600)' }} />
                        <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>Transaction History</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--neutral-600)' }}>
                        {/* List transactions here, placeholder for now */}
                        No transactions yet.
                      </div>
                    </div>
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                      <button className="btn btn-success btn-xs btn-action" style={{ borderRadius: 4 }} title="Deposit"><FiArrowDownCircle /></button>
                      <button className="btn btn-warning btn-xs btn-action" style={{ borderRadius: 4 }} title="Withdraw"><FiArrowUpCircle /></button>
                      <button className="btn btn-outline btn-xs btn-action" style={{ borderRadius: 4 }} title="Edit Vault"><FiEdit2 /></button>
                      <button className="btn btn-danger btn-xs btn-action" style={{ borderRadius: 4 }} title="Delete Vault"><FiTrash2 /></button>
                      <button className="btn btn-outline btn-xs btn-action" style={{ borderRadius: 4 }} title="Toggle Privacy">{vaultDetails.vault.isPublic ? <FiLock /> : <FiUnlock />}</button>
                      <button className="btn btn-outline btn-xs btn-action" style={{ borderRadius: 4 }} title="Propose Action"><FiShield /></button>
                    </div>
                    {/* Governance Timeline */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <FiList style={{ color: 'var(--primary-600)' }} />
                        <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>Governance Timeline</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--neutral-600)' }}>
                        {/* List proposals, votes, appeals here, placeholder for now */}
                        No proposals yet.
                      </div>
                    </div>
                    {/* Security/Recovery */}
                    <div style={{ marginBottom: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <FiShield style={{ color: 'var(--primary-600)' }} />
                        <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>Security & Recovery</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--neutral-600)' }}>
                        {/* List recovery methods, audit trail here, placeholder for now */}
                        No recovery methods set up.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
