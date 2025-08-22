import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiCheck, FiRefreshCw, FiCopy, FiMail, FiPhone, FiKey, FiShield } from 'react-icons/fi';
import UsernameManager from '../components/UsernameManager';

export default function Profile() {
  const { user, principal, cryptoWallets, recoveryMethods, updateProfile } = useAuth();
  const [username, setUsername] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setUsername(user?.displayName || '');
  }, [user?.displayName]);

  const walletCount = cryptoWallets?.length || 0;
  const recoveryCount = recoveryMethods?.length || 0;

  const onSave = async () => {
    setMessage(null);
    setError(null);
    const trimmed = (username || '').trim();
    if (!trimmed) {
      setError('Username cannot be empty');
      return;
    }
    if (!/^[-a-zA-Z0-9_\.]{3,24}$/.test(trimmed)) {
      setError('Use 3–24 chars: letters, numbers, dash, underscore, dot');
      return;
    }
    try {
      setSaving(true);
      await updateProfile(trimmed, null);
      setMessage('Saved');
    } catch (e) {
      setError(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const InfoRow = ({ label, children }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px dashed rgba(255,255,255,0.08)' }}>
      <div style={{ opacity: 0.75, fontSize: 12 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{children}</div>
    </div>
  );

  const iconForRecovery = (type) => {
    switch (type) {
      case 'email': return <FiMail />;
      case 'phone': return <FiPhone />;
      case 'backup_email': return <FiMail />;
      case 'custom': return <FiKey />;
      default: return <FiShield />;
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center' }}>
          <FiUser />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Your Profile</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Manage your username and view account details</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr', maxWidth: 720 }}>
        {/* Username Manager Component */}
        <UsernameManager />

        {/* Account details card */}
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, background: '#0b0f1a' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Account Details</div>
          <InfoRow label="Principal">
            <span style={{ fontFamily: 'monospace', fontSize: 12, marginRight: 8 }}>{principal ? `${principal.toString().slice(0,12)}...${principal.toString().slice(-6)}` : '—'}</span>
            <button className="btn btn-text" onClick={() => navigator.clipboard.writeText(principal?.toString() || '')}><FiCopy /> Copy</button>
          </InfoRow>
          <InfoRow label="Joined">{user?.createdAt ? new Date(Number(user.createdAt)).toLocaleString() : '—'}</InfoRow>
          <InfoRow label="Last login">{user?.lastLoginAt ? new Date(Number(user.lastLoginAt)).toLocaleString() : '—'}</InfoRow>
          <InfoRow label="Wallets">{walletCount}</InfoRow>
          <InfoRow label="Recovery methods">{recoveryCount}</InfoRow>
        </div>

        {/* Recovery methods card */}
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, background: '#0b0f1a' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Recovery Methods</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {(recoveryMethods || []).map((m, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {iconForRecovery(m.methodType)}
                  <div style={{ fontWeight: 600 }}>{m.methodType}</div>
                </div>
                <div style={{ opacity: 0.8, fontSize: 12 }}>{m.value || '—'}</div>
              </div>
            ))}
            {(!recoveryMethods || recoveryMethods.length === 0) && (
              <div style={{ opacity: 0.7, fontSize: 12 }}>No recovery methods added yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


