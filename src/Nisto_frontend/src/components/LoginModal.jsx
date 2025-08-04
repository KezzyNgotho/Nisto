import React,{ useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AccountRecovery from './AccountRecovery';

function LoginModal({ isOpen, onClose }) {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showRecovery, setShowRecovery] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async () => {
    try {
      console.log('Login button clicked, starting login process...');
      await login();
      console.log('Login successful, navigating to dashboard...');
      onClose();
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleRecoveryComplete = (instructions) => {
    setShowRecovery(false);
    alert('Recovery instructions: ' + instructions);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="login-modal">
        <div className="modal-header">
          <h2>Sign in to Nisto</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="login-info">
            <div className="info-icon">🔐</div>
            <p>Use your Internet Identity to securely access your Nisto account</p>
          </div>
          
          <button 
            className="btn btn-primary btn-lg login-btn"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span className="btn-icon">🌐</span>
                <span>Sign in with Internet Identity</span>
              </>
            )}
          </button>
          
          <div className="login-help">
            <p>
              Don't have an Internet Identity?{' '}
              <a 
                href="https://identity.ic0.app" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Create one here
              </a>
            </p>
            <p>
              Lost access to your Internet Identity?{' '}
              <button 
                className="btn-link"
                onClick={() => setShowRecovery(true)}
              >
                Recover your account
              </button>
            </p>
          </div>
        </div>
      </div>
      
      <AccountRecovery 
        isOpen={showRecovery}
        onClose={() => setShowRecovery(false)}
        onRecoveryComplete={handleRecoveryComplete}
      />
    </div>
  );
}

export default LoginModal; 