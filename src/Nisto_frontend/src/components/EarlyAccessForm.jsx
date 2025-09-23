import React, { useState } from 'react';
import { Actor } from '@dfinity/agent';
import { config } from '../config/config';
import { canisterId, createActor } from '../../../declarations/Nisto_backend';

const EarlyAccessForm = ({ theme }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const actor = createActor(canisterId);
      const result = await actor.registerEarlyAccess(email);
      
      if ('ok' in result) {
        setStatus('success');
        setMessage(result.ok);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(result.err);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to register. Please try again.');
      console.error('Early access registration error:', error);
    }
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '8px',
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.background.secondary,
            color: theme.colors.text.primary,
            fontSize: '16px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: theme.colors.primary,
            color: '#fff',
            fontSize: '16px',
            cursor: status === 'loading' ? 'wait' : 'pointer',
            opacity: status === 'loading' ? 0.7 : 1,
            transition: 'all 0.2s',
          }}
        >
          {status === 'loading' ? 'Registering...' : 'Get Early Access'}
        </button>
      </form>
      
      {message && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: status === 'success' ? theme.colors.success + '20' : theme.colors.error + '20',
            color: status === 'success' ? theme.colors.success : theme.colors.error,
            fontSize: '14px',
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default EarlyAccessForm;
