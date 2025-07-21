import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { FiMail, FiPhone, FiUserCheck, FiPlus, FiCheck, FiTrash2, FiKey, FiUser, FiAlertCircle } from 'react-icons/fi';

const methodIcons = {
  email: <FiMail />, phone: <FiPhone />, backup_email: <FiMail />, security_qa: <FiKey />, emergency_contact: <FiUserCheck />
};

export default function RecoverySetup({ onClose }) {
  const {
    user,
    recoveryMethods,
    refreshRecoveryMethods,
    addRecoveryMethod,
    completeRecoverySetup,
    addSecurityQuestions,
  } = useAuth();
  const { showToast } = useNotification();

  const [methodType, setMethodType] = useState('email');
  const [methodValue, setMethodValue] = useState('');
  const [securityQuestions, setSecurityQuestions] = useState([{ question: '', answer: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setupComplete, setSetupComplete] = useState(user?.recoverySetupCompleted);

  useEffect(() => {
    refreshRecoveryMethods();
    setSetupComplete(user?.recoverySetupCompleted);
    // eslint-disable-next-line
  }, [user]);

  const handleAddMethod = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addRecoveryMethod(methodType, methodValue);
      showToast({ message: 'Recovery method added', type: 'success', icon: <FiCheck /> });
      setMethodValue('');
      refreshRecoveryMethods();
    } catch (err) {
      showToast({ message: 'Failed to add method', type: 'error', icon: <FiAlertCircle /> });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSecurityQuestions = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const questions = securityQuestions.map(q => [q.question, q.answer]);
      await addSecurityQuestions(questions);
      showToast({ message: 'Security questions added', type: 'success', icon: <FiCheck /> });
      setSecurityQuestions([{ question: '', answer: '' }]);
      refreshRecoveryMethods();
    } catch (err) {
      showToast({ message: 'Failed to add security questions', type: 'error', icon: <FiAlertCircle /> });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteSetup = async () => {
    setIsSubmitting(true);
    try {
      await completeRecoverySetup();
      setSetupComplete(true);
      showToast({ message: 'Recovery setup completed', type: 'success', icon: <FiCheck /> });
    } catch (err) {
      showToast({ message: 'Failed to complete setup', type: 'error', icon: <FiAlertCircle /> });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeQuestion = (idx, field, value) => {
    setSecurityQuestions(qs =>
      qs.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );
  };

  const handleAddQuestionField = () => {
    setSecurityQuestions(qs => [...qs, { question: '', answer: '' }]);
  };

  return (
    <div className="recovery-setup-modal">
      <div className="recovery-setup-header">
        <h2><FiKey /> Account Recovery Setup</h2>
        {onClose && <button className="modal-close" onClick={onClose}>×</button>}
      </div>
      <div className="recovery-setup-content">
        <h4>Add Recovery Method</h4>
        <form onSubmit={handleAddMethod} className="recovery-method-form">
          <select value={methodType} onChange={e => setMethodType(e.target.value)}>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="backup_email">Backup Email</option>
            <option value="emergency_contact">Emergency Contact</option>
          </select>
          <input
            type="text"
            placeholder={methodType === 'phone' ? 'Enter phone number' : 'Enter email/contact'}
            value={methodValue}
            onChange={e => setMethodValue(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Add</button>
        </form>

        <h4>Security Questions</h4>
        <form onSubmit={handleAddSecurityQuestions} className="security-questions-form">
          {securityQuestions.map((q, idx) => (
            <div key={idx} className="security-question-row">
              <input
                type="text"
                placeholder="Question"
                value={q.question}
                onChange={e => handleChangeQuestion(idx, 'question', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Answer"
                value={q.answer}
                onChange={e => handleChangeQuestion(idx, 'answer', e.target.value)}
                required
              />
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={handleAddQuestionField}><FiPlus /> Add Question</button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Save Questions</button>
        </form>

        <h4>Current Recovery Methods</h4>
        <div className="recovery-methods-list">
          {recoveryMethods && recoveryMethods.length > 0 ? recoveryMethods.map(method => (
            <div key={method.id} className="recovery-method-item">
              <span className="method-icon">{methodIcons[method.methodType] || <FiUser />}</span>
              <span className="method-type">{method.methodType.replace('_', ' ')}</span>
              <span className="method-value">{method.value}</span>
              <span className={`method-status ${method.isVerified ? 'verified' : 'unverified'}`}>{method.isVerified ? 'Verified' : 'Unverified'}</span>
            </div>
          )) : <div className="empty-notifications"><FiAlertCircle /> No recovery methods set up yet.</div>}
        </div>

        <div className="recovery-setup-actions">
          <button className="btn btn-success" onClick={handleCompleteSetup} disabled={setupComplete || isSubmitting}>
            {setupComplete ? <><FiCheck /> Setup Complete</> : 'Complete Recovery Setup'}
          </button>
        </div>
      </div>
    </div>
  );
} 