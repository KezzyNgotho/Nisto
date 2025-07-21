import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { FiMail, FiPhone, FiKey, FiUserCheck, FiCheck, FiAlertCircle } from 'react-icons/fi';

const methodOptions = [
  { value: 'email', label: 'Email', icon: <FiMail /> },
  { value: 'phone', label: 'Phone', icon: <FiPhone /> },
  { value: 'security', label: 'Security Questions', icon: <FiKey /> },
  { value: 'emergency', label: 'Emergency Contact', icon: <FiUserCheck /> },
];

export default function AccountRecovery({ isOpen, onClose, onRecoveryComplete }) {
  const { initiateRecovery, verifyRecovery, completeRecovery, linkRecoveredAccount } = useAuth();
  const { showToast } = useNotification();

  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const [recoveryRequestId, setRecoveryRequestId] = useState(null);
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [securityAnswers, setSecurityAnswers] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryToken, setRecoveryToken] = useState(null);
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleStartRecovery = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await initiateRecovery(identifier, method);
      setRecoveryRequestId(result.recoveryRequestId);
      if (result.securityQuestions) {
        setSecurityQuestions(result.securityQuestions);
        setSecurityAnswers(result.securityQuestions.map(() => ''));
        setStep(3); // Security questions step
      } else {
        setStep(2); // Verification code step
      }
      showToast({ message: result.message, type: 'info', icon: <FiCheck /> });
    } catch (err) {
      showToast({ message: err.message || 'Failed to initiate recovery', type: 'error', icon: <FiAlertCircle /> });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let answers = null;
      if (method === 'security') {
        answers = securityQuestions.map((q, i) => [q[0], securityAnswers[i]]);
      }
      const token = await verifyRecovery(recoveryRequestId, verificationCode || null, answers);
      setRecoveryToken(token);
      setStep(4); // Complete recovery step
      showToast({ message: 'Verification successful', type: 'success', icon: <FiCheck /> });
    } catch (err) {
      showToast({ message: err.message || 'Verification failed', type: 'error', icon: <FiAlertCircle /> });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await completeRecovery(recoveryToken, 'Recovered device');
      setInstructions(result.instructions);
      setStep(5);
      showToast({ message: 'Account recovery completed', type: 'success', icon: <FiCheck /> });
      if (onRecoveryComplete) onRecoveryComplete(result.instructions);
    } catch (err) {
      showToast({ message: err.message || 'Failed to complete recovery', type: 'error', icon: <FiAlertCircle /> });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="account-recovery-modal">
        <div className="modal-header">
          <h2><FiKey /> Account Recovery</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          {step === 1 && (
            <form onSubmit={handleStartRecovery} className="recovery-form">
              <label>Choose recovery method:</label>
              <select value={method} onChange={e => setMethod(e.target.value)}>
                {methodOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder={method === 'phone' ? 'Enter phone number' : 'Enter email/identifier'}
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={isLoading}>Start Recovery</button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerify} className="recovery-form">
              <label>Enter the verification code sent to your {method}:</label>
              <input
                type="text"
                placeholder="Verification code"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={isLoading}>Verify</button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleVerify} className="recovery-form">
              <label>Answer your security questions:</label>
              {securityQuestions.map((q, i) => (
                <div key={q[0]} className="security-question-row">
                  <span>{q[1]}</span>
                  <input
                    type="text"
                    placeholder="Your answer"
                    value={securityAnswers[i]}
                    onChange={e => setSecurityAnswers(ans => ans.map((a, idx) => idx === i ? e.target.value : a))}
                    required
                  />
                </div>
              ))}
              <button type="submit" className="btn btn-primary" disabled={isLoading}>Verify</button>
            </form>
          )}

          {step === 4 && (
            <form onSubmit={handleComplete} className="recovery-form">
              <label>Recovery verified! Complete recovery to regain access.</label>
              <button type="submit" className="btn btn-success" disabled={isLoading}>Complete Recovery</button>
            </form>
          )}

          {step === 5 && (
            <div className="recovery-complete">
              <FiCheck className="success-icon" />
              <h3>Account Recovery Complete</h3>
              <p>{instructions}</p>
              <button className="btn btn-primary" onClick={onClose}>Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 