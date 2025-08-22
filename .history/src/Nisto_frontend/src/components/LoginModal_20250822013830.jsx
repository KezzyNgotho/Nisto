import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiX, FiShield, FiUser } from 'react-icons/fi';

const LoginModal = ({ isOpen, onClose }) => {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setError('');
      await login();
      onClose();
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Welcome to Nisto</h3>
          <button onClick={onClose} className="close-btn">
            <FiX />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="login-options">
            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className="login-btn"
            >
              <FiShield />
              {isLoading ? 'Connecting...' : 'Connect with Internet Identity'}
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
