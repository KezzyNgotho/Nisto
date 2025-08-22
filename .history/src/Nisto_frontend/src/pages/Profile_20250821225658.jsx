import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiUser, 
  FiCheck, 
  FiRefreshCw, 
  FiCopy, 
  FiMail, 
  FiPhone, 
  FiKey, 
  FiShield,
  FiEdit2,
  FiCamera,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiPlus,
  FiCalendar,
  FiClock,
  FiCreditCard,
  FiLock,
  FiGlobe,
  FiSettings,
  FiBell,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import UsernameManager from '../components/UsernameManager';

export default function Profile() {
  const { user, principal, cryptoWallets, recoveryMethods, updateProfile } = useAuth();
  const [username, setUsername] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

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
      setMessage('Profile updated successfully!');
    } catch (e) {
      setError(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatarUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage('Copied to clipboard!');
    setTimeout(() => setMessage(null), 2000);
  };

  const iconForRecovery = (type) => {
    switch (type) {
      case 'email': return <FiMail size={16} />;
      case 'phone': return <FiPhone size={16} />;
      case 'backup_email': return <FiMail size={16} />;
      case 'custom': return <FiKey size={16} />;
      default: return <FiShield size={16} />;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (timestamp) => {
    console.log('formatDate input:', timestamp, 'type:', typeof timestamp);
    
    if (!timestamp) {
      console.log('formatDate: no timestamp provided');
      return '—';
    }
    
    try {
      // Handle different timestamp formats
      let date;
      if (typeof timestamp === 'number') {
        console.log('formatDate: processing as number:', timestamp);
        date = new Date(timestamp);
      } else if (typeof timestamp === 'string') {
        console.log('formatDate: processing as string:', timestamp);
        const parsed = parseInt(timestamp);
        console.log('formatDate: parsed string to number:', parsed);
        if (!isNaN(parsed)) {
          date = new Date(parsed);
        } else {
          date = new Date(timestamp);
        }
      } else {
        console.log('formatDate: processing as other type:', timestamp);
        date = new Date(timestamp);
      }
      
      console.log('formatDate: created date object:', date);
      console.log('formatDate: date.getTime():', date.getTime());
      console.log('formatDate: isNaN check:', isNaN(date.getTime()));
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.log('formatDate: invalid date detected');
        return '—';
      }
      
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      console.log('formatDate: formatted result:', formatted);
      return formatted;
    } catch (error) {
      console.error('formatDate: parsing error:', error);
      return '—';
    }
  };

  const formatDateTime = (timestamp) => {
    console.log('formatDateTime input:', timestamp, 'type:', typeof timestamp);
    
    if (!timestamp) {
      console.log('formatDateTime: no timestamp provided');
      return '—';
    }
    
    try {
      // Handle different timestamp formats
      let date;
      if (typeof timestamp === 'number') {
        console.log('formatDateTime: processing as number:', timestamp);
        date = new Date(timestamp);
      } else if (typeof timestamp === 'string') {
        console.log('formatDateTime: processing as string:', timestamp);
        const parsed = parseInt(timestamp);
        console.log('formatDateTime: parsed string to number:', parsed);
        if (!isNaN(parsed)) {
          date = new Date(parsed);
        } else {
          date = new Date(timestamp);
        }
      } else {
        console.log('formatDateTime: processing as other type:', timestamp);
        date = new Date(timestamp);
      }
      
      console.log('formatDateTime: created date object:', date);
      console.log('formatDateTime: date.getTime():', date.getTime());
      console.log('formatDateTime: isNaN check:', isNaN(date.getTime()));
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.log('formatDateTime: invalid date detected');
        return '—';
      }
      
      const formatted = date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      console.log('formatDateTime: formatted result:', formatted);
      return formatted;
    } catch (error) {
      console.error('formatDateTime: parsing error:', error);
      return '—';
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
      {/* Success/Error Messages */}
      {message && (
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '1rem',
          borderRadius: '0.75rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        }}>
          <FiCheck size={20} />
          {message}
        </div>
      )}

      {error && (
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          padding: '1rem',
          borderRadius: '0.75rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
        }}>
          <FiShield size={20} />
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 2fr' }}>
        {/* Left Column - Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Profile Card */}
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            position: 'relative'
          }}>
            {/* Avatar Section */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: avatarUrl ? `url(${avatarUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: avatarUrl ? 'transparent' : 'white',
                margin: '0 auto',
                position: 'relative',
                border: '4px solid white',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              }}>
                {!avatarUrl && getInitials(user?.displayName || user?.username)}
              </div>
              
              {/* Upload Button */}
              <label style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s'
              }}>
                <FiCamera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* User Info */}
            <h2 style={{ 
              margin: '0 0 0.5rem 0', 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              color: '#1e293b' 
            }}>
              {user?.displayName || user?.username || 'User'}
            </h2>
            
            <p style={{ 
              margin: '0 0 1.5rem 0', 
              fontSize: '0.875rem', 
              color: '#64748b' 
            }}>
              {user?.email || 'No email provided'}
            </p>

            {/* Status Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              borderRadius: '2rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '1.5rem'
            }}>
              <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }}></div>
              Active Account
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>{walletCount}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Wallets</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{recoveryCount}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Recovery</div>
              </div>
            </div>
          </div>

          {/* Security Status */}
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              fontSize: '1.125rem', 
              fontWeight: 600, 
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FiShield size={20} />
              Security Status
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                background: '#f8fafc',
                borderRadius: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiLock size={16} color="#10b981" />
                  <span style={{ fontSize: '0.875rem', color: '#374151' }}>Account Security</span>
                </div>
                <div style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 600 }}>Secure</div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                background: '#f8fafc',
                borderRadius: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiMail size={16} color="#3b82f6" />
                  <span style={{ fontSize: '0.875rem', color: '#374151' }}>Email Verified</span>
                </div>
                <div style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 600 }}>✓</div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                background: '#f8fafc',
                borderRadius: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiShield size={16} color="#f59e0b" />
                  <span style={{ fontSize: '0.875rem', color: '#374151' }}>Recovery Methods</span>
                </div>
                <div style={{ color: recoveryCount > 0 ? '#10b981' : '#ef4444', fontSize: '0.875rem', fontWeight: 600 }}>
                  {recoveryCount > 0 ? `${recoveryCount} Active` : 'None'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Account Details */}
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ 
              margin: '0 0 1.5rem 0', 
              fontSize: '1.25rem', 
              fontWeight: 600, 
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FiUser size={20} />
              Account Details
            </h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: '0.5rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Principal ID</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>
                    {principal ? `${principal.toString().slice(0, 12)}...${principal.toString().slice(-8)}` : '—'}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(principal?.toString() || '')}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <FiCopy size={14} />
                  Copy
                </button>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: '0.5rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Joined</div>
                  <div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>
                    {user?.createdAt ? formatDate(user.createdAt) : '—'}
                  </div>
                </div>
                <FiCalendar size={16} color="#64748b" />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: '0.5rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Last Login</div>
                  <div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>
                    {user?.lastLoginAt ? formatDateTime(user.lastLoginAt) : '—'}
                  </div>
                </div>
                <FiClock size={16} color="#64748b" />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: '0.5rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Connected Wallets</div>
                  <div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>{walletCount} wallets</div>
                </div>
                <FiCreditCard size={16} color="#64748b" />
              </div>
            </div>
          </div>

          {/* Username Manager */}
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ 
              margin: '0 0 1.5rem 0', 
              fontSize: '1.25rem', 
              fontWeight: 600, 
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FiEdit2 size={20} />
              Username Settings
            </h3>
            <UsernameManager />
          </div>

          {/* Recovery Methods */}
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1.5rem' 
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.25rem', 
                fontWeight: 600, 
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FiShield size={20} />
                Recovery Methods
              </h3>
              <button style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}>
                <FiPlus size={14} />
                Add Method
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(recoveryMethods || []).map((method, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      {iconForRecovery(method.methodType)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                        {method.methodType.charAt(0).toUpperCase() + method.methodType.slice(1)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {method.value || 'Not configured'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{
                      background: 'none',
                      border: '1px solid #e2e8f0',
                      padding: '0.375rem',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      color: '#64748b',
                      transition: 'all 0.2s'
                    }}>
                      <FiEdit2 size={14} />
                    </button>
                    <button style={{
                      background: 'none',
                      border: '1px solid #ef4444',
                      padding: '0.375rem',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      color: '#ef4444',
                      transition: 'all 0.2s'
                    }}>
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              
              {(!recoveryMethods || recoveryMethods.length === 0) && (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#64748b',
                  fontSize: '0.875rem'
                }}>
                  <FiShield size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <div>No recovery methods added yet.</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    Add recovery methods to secure your account
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


