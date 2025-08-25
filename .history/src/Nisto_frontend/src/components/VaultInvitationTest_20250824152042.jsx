import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import SafeIcon from './SafeIcon';

export default function VaultInvitationTest() {
  const { theme } = useTheme();
  const { inviteVaultMember, respondToVaultInvitation, user } = useAuth();
  const [vaultId, setVaultId] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('member');
  const [response, setResponse] = useState('accept');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleInvite = async () => {
    if (!vaultId || !userId) {
      setResult({ error: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const result = await inviteVaultMember(vaultId, userId, role);
      setResult({ success: true, data: result });
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!vaultId) {
      setResult({ error: 'Please enter vault ID' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const result = await respondToVaultInvitation(vaultId, response);
      setResult({ success: true, data: result });
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: theme.colors.background.primary }}>
      <h2 style={{ color: theme.colors.text.primary, marginBottom: '20px' }}>
        <SafeIcon iconName="FiUserPlus" size={24} style={{ marginRight: '8px' }} />
        Vault Invitation Test
      </h2>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: theme.colors.text.primary, marginBottom: '15px' }}>Send Invitation</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Vault ID"
            value={vaultId}
            onChange={(e) => setVaultId(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: `1px solid ${theme.colors.border}`,
              backgroundColor: theme.colors.background.secondary,
              color: theme.colors.text.primary
            }}
          />
          <input
            type="text"
            placeholder="User ID (Principal)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: `1px solid ${theme.colors.border}`,
              backgroundColor: theme.colors.background.secondary,
              color: theme.colors.text.primary
            }}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: `1px solid ${theme.colors.border}`,
              backgroundColor: theme.colors.background.secondary,
              color: theme.colors.text.primary
            }}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={handleInvite}
            disabled={loading}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: theme.colors.primary,
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: theme.colors.text.primary, marginBottom: '15px' }}>Respond to Invitation</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Vault ID"
            value={vaultId}
            onChange={(e) => setVaultId(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: `1px solid ${theme.colors.border}`,
              backgroundColor: theme.colors.background.secondary,
              color: theme.colors.text.primary
            }}
          />
          <select
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: `1px solid ${theme.colors.border}`,
              backgroundColor: theme.colors.background.secondary,
              color: theme.colors.text.primary
            }}
          >
            <option value="accept">Accept</option>
            <option value="decline">Decline</option>
          </select>
          <button
            onClick={handleRespond}
            disabled={loading}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: theme.colors.secondary,
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Processing...' : 'Respond to Invitation'}
          </button>
        </div>
      </div>

      {result && (
        <div style={{
          padding: '15px',
          borderRadius: '8px',
          backgroundColor: result.error ? theme.colors.error + '20' : theme.colors.success + '20',
          border: `1px solid ${result.error ? theme.colors.error : theme.colors.success}`,
          color: result.error ? theme.colors.error : theme.colors.success
        }}>
          <h4>{result.error ? 'Error' : 'Success'}</h4>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            {result.error || JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: theme.colors.background.secondary, borderRadius: '8px' }}>
        <h4 style={{ color: theme.colors.text.primary, marginBottom: '10px' }}>Current User Info</h4>
        <p style={{ color: theme.colors.text.secondary, fontSize: '12px' }}>
          <strong>Principal:</strong> {user?.principal || 'Not authenticated'}
        </p>
        <p style={{ color: theme.colors.text.secondary, fontSize: '12px' }}>
          <strong>Username:</strong> {user?.username || 'Not set'}
        </p>
      </div>
    </div>
  );
} 