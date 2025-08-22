import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiX, FiUser, FiCheck, FiRefreshCw, FiShield } from 'react-icons/fi';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, principal, updateProfile } = useAuth();
  const [username, setUsername] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setUsername(user?.displayName || '');
      setError(null);
      setSuccess(null);
    }
    // eslint-disable-next-line
  }, [isOpen]);

  if (!isOpen) return null;

  const onSave = async () => {
    setError(null);
    setSuccess(null);
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
      setSuccess('Profile updated');
      setTimeout(() => onClose && onClose(), 800);
    } catch (e) {
      setError(e?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 };
  const modalStyle = { background: '#0b0f1a', borderRadius: 12, width: 420, maxWidth: '92vw', padding: 16, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' };
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#fff' };

  return (
    <div style={overlayStyle} onClick={() => !saving && onClose && onClose()}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center' }}>
              <FiUser />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Profile</div>
              <div style={{ fontSize: 12, opacity: 0.7, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiShield /> {principal || '—'}
              </div>
            </div>
          </div>
          <button className="btn btn-text" onClick={() => onClose && onClose()} disabled={saving}><FiX /></button>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'block', fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Username</label>
          <input
            style={inputStyle}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter a username"
            disabled={saving}
          />
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>Shown publicly. Your principal remains private here.</div>
        </div>

        {error && (
          <div className="error-message" style={{ marginTop: 10 }}>{error}</div>
        )}
        {success && (
          <div className="success-message" style={{ marginTop: 10 }}><FiCheck /> {success}</div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
          <button className="btn btn-text" onClick={() => onClose && onClose()} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={onSave} disabled={saving}>
            {saving ? (<><FiRefreshCw className="spin" /> Saving...</>) : (<><FiCheck /> Save</>)}
          </button>
        </div>
      </div>
    </div>
  );
}


