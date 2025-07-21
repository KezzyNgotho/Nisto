import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { FiMail, FiPhone, FiUserCheck, FiPlus, FiCheck, FiTrash2, FiKey, FiUser, FiAlertCircle, FiShield, FiInfo } from 'react-icons/fi';

const methodIcons = {
  email: <FiMail />, phone: <FiPhone />, backup_email: <FiMail />, security_qa: <FiKey />, emergency_contact: <FiUserCheck />
};

export default function RecoverySetup({ onClose, initialSetup }) {
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
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [securityQuestions, setSecurityQuestions] = useState([{ question: '', answer: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setupComplete, setSetupComplete] = useState(user?.recoverySetupCompleted);
  const [selectedMethods, setSelectedMethods] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    refreshRecoveryMethods();
    setSetupComplete(user?.recoverySetupCompleted);
    // eslint-disable-next-line
  }, [user]);

  // --- Modal UI for initial setup ---
  if (initialSetup) {
    const methodOptions = [
      { key: 'email', label: 'Email Recovery', icon: <FiMail />, recommended: true },
      { key: 'phone', label: 'SMS Recovery', icon: <FiPhone />, recommended: true },
      { key: 'security_qa', label: 'Security Questions', icon: <FiKey /> },
      { key: 'emergency_contact', label: 'Emergency Contact', icon: <FiUserCheck /> },
    ];
    const [inputs, setInputs] = useState({
      email: '',
      phone: '',
      security_qa: [{ question: '', answer: '' }],
      emergency_contact: { name: '', email: '', relationship: '' },
    });
    const [submitting, setSubmitting] = useState(false);
    const toggleMethod = (key) => {
      setSelectedMethods((prev) =>
        prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
      );
      setError('');
    };
    const handleInput = (key, value) => {
      setInputs((prev) => ({ ...prev, [key]: value }));
    };
    const handleSecurityQA = (idx, field, value) => {
      setInputs((prev) => ({
        ...prev,
        security_qa: prev.security_qa.map((q, i) => i === idx ? { ...q, [field]: value } : q)
      }));
    };
    const addSecurityQA = () => {
      setInputs((prev) => ({ ...prev, security_qa: [...prev.security_qa, { question: '', answer: '' }] }));
    };
    const handleECInput = (field, value) => {
      setInputs((prev) => ({ ...prev, emergency_contact: { ...prev.emergency_contact, [field]: value } }));
    };
    // Validation
    const allValid = selectedMethods.length > 0 && selectedMethods.every((m) => {
      if (m === 'email') return inputs.email && /@/.test(inputs.email);
      if (m === 'phone') return inputs.phone && inputs.phone.length >= 8;
      if (m === 'security_qa') return inputs.security_qa.every(q => q.question && q.answer);
      if (m === 'emergency_contact') return inputs.emergency_contact.name && /@/.test(inputs.emergency_contact.email) && inputs.emergency_contact.relationship;
      return false;
    });
    const handleSetup = async () => {
      if (!allValid) {
        setError('Please fill all required fields for selected methods');
        return;
      }
      setSubmitting(true);
      try {
        if (selectedMethods.includes('email')) await addRecoveryMethod('email', inputs.email);
        if (selectedMethods.includes('phone')) await addRecoveryMethod('phone', inputs.phone);
        if (selectedMethods.includes('security_qa')) await addSecurityQuestions(inputs.security_qa.map(q => [q.question, q.answer]));
        if (selectedMethods.includes('emergency_contact')) await addRecoveryMethod('emergency_contact', JSON.stringify(inputs.emergency_contact));
        showToast({ message: 'Recovery setup complete', type: 'success', icon: <FiCheck /> });
        if (onClose) onClose();
      } catch (err) {
        setError('Failed to set up recovery. Please try again.');
      } finally {
        setSubmitting(false);
      }
    };
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px 0 rgba(59,130,246,0.10)', maxWidth: 520, width: '98vw', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Blue header bar */}
          <div style={{ background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)', color: '#fff', padding: '1.2rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><FiShield size={24} /> <span style={{ fontWeight: 700, fontSize: 20 }}>Account Recovery Setup</span></div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', borderRadius: 8, padding: 4, transition: 'background 0.18s' }}>&times;</button>
          </div>
          <div style={{ padding: '2rem 2.5rem 0 2.5rem', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ color: 'var(--neutral-700)', fontSize: 16, marginBottom: 8 }}>Choose your recovery methods and fill in the required information:</div>
            <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--neutral-800)', marginBottom: 8 }}>Select Recovery Methods</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}>
              {methodOptions.map(opt => (
                <button
                  key={opt.key}
                  className="dashboard-card"
                  style={{
                    minWidth: 180,
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '1.1rem 1.2rem',
                    border: selectedMethods.includes(opt.key) ? '2px solid #1976d2' : '1.2px solid var(--neutral-200)',
                    boxShadow: selectedMethods.includes(opt.key) ? '0 2px 8px 0 rgba(25,118,210,0.08)' : 'var(--shadow-sm)',
                    background: selectedMethods.includes(opt.key) ? 'var(--primary-50)' : '#fff',
                    cursor: 'pointer',
                    position: 'relative',
                    fontWeight: 600,
                    fontSize: 15,
                    transition: 'all 0.18s',
                  }}
                  onClick={() => toggleMethod(opt.key)}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                  {opt.recommended && <span style={{ background: '#e6f9ed', color: '#059669', fontWeight: 700, fontSize: 13, borderRadius: 8, padding: '2px 10px', marginLeft: 8 }}>Recommended</span>}
                </button>
              ))}
            </div>
            {/* Dynamic input fields for selected methods */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {selectedMethods.includes('email') && (
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={inputs.email}
                  onChange={e => handleInput('email', e.target.value)}
                  required
                  className="dashboard-card"
                  style={{ padding: '0.8rem 1rem', fontSize: 15, border: '1.2px solid var(--primary-100)', borderRadius: 8 }}
                />
              )}
              {selectedMethods.includes('phone') && (
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={inputs.phone}
                  onChange={e => handleInput('phone', e.target.value)}
                  required
                  className="dashboard-card"
                  style={{ padding: '0.8rem 1rem', fontSize: 15, border: '1.2px solid var(--primary-100)', borderRadius: 8 }}
                />
              )}
              {selectedMethods.includes('security_qa') && (
                <div className="dashboard-card" style={{ padding: '1rem', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontWeight: 600, color: 'var(--primary-700)', marginBottom: 4 }}>Security Questions</div>
                  {inputs.security_qa.map((q, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Question"
                        value={q.question}
                        onChange={e => handleSecurityQA(idx, 'question', e.target.value)}
                        required
                        style={{ flex: 2, padding: '0.6rem', borderRadius: 6, border: '1px solid var(--primary-100)' }}
                      />
                      <input
                        type="text"
                        placeholder="Answer"
                        value={q.answer}
                        onChange={e => handleSecurityQA(idx, 'answer', e.target.value)}
                        required
                        style={{ flex: 2, padding: '0.6rem', borderRadius: 6, border: '1px solid var(--primary-100)' }}
                      />
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary" style={{ marginTop: 6, alignSelf: 'flex-start' }} onClick={addSecurityQA}><FiPlus /> Add Question</button>
                </div>
              )}
              {selectedMethods.includes('emergency_contact') && (
                <div className="dashboard-card" style={{ padding: '1rem', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontWeight: 600, color: 'var(--primary-700)', marginBottom: 4 }}>Emergency Contact</div>
                  <input
                    type="text"
                    placeholder="Name"
                    value={inputs.emergency_contact.name}
                    onChange={e => handleECInput('name', e.target.value)}
                    required
                    style={{ padding: '0.6rem', borderRadius: 6, border: '1px solid var(--primary-100)' }}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={inputs.emergency_contact.email}
                    onChange={e => handleECInput('email', e.target.value)}
                    required
                    style={{ padding: '0.6rem', borderRadius: 6, border: '1px solid var(--primary-100)' }}
                  />
                  <input
                    type="text"
                    placeholder="Relationship"
                    value={inputs.emergency_contact.relationship}
                    onChange={e => handleECInput('relationship', e.target.value)}
                    required
                    style={{ padding: '0.6rem', borderRadius: 6, border: '1px solid var(--primary-100)' }}
                  />
                </div>
              )}
            </div>
            <div style={{ background: '#eaf6ff', color: '#1976d2', borderRadius: 8, padding: '0.9rem 1.1rem', fontSize: 15, display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiInfo style={{ fontSize: 18 }} /> <b>Tip:</b> Email and SMS are the most reliable recovery options. Choose at least one method to secure your account.
            </div>
            {error && <div style={{ color: '#dc2626', fontWeight: 600, fontSize: 15, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}><FiAlertCircle /> {error}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, background: 'var(--neutral-50)', borderTop: '1.5px solid var(--neutral-100)', padding: '1.1rem 2rem', marginTop: 24 }}>
            <button className="btn btn-secondary" onClick={onClose}>Skip for now</button>
            <button className="btn btn-primary" style={{ opacity: allValid && !submitting ? 1 : 0.6 }} disabled={!allValid || submitting} onClick={handleSetup}>
              <FiCheck style={{ marginRight: 6 }} /> {submitting ? 'Setting Up...' : 'Setup Recovery'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddMethod = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addRecoveryMethod(methodType, methodValue);
      showToast({ message: 'Recovery method added', type: 'success', icon: <FiCheck /> });
      setMethodValue('');
      setShowAddMethod(false);
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
    <>
      <section className="dashboard-section" style={{ maxWidth: 900, margin: '0 auto', marginTop: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 20, color: 'var(--primary-700)' }}>
            <FiShield style={{ fontSize: 22 }} /> Recovery Methods
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Add Method</button>
        </div>
        {/* Methods List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {recoveryMethods && recoveryMethods.length > 0 ? recoveryMethods.map(method => (
            <div key={method.id} className="dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '1.1rem 1.3rem' }}>
              <span style={{ fontSize: 22, color: 'var(--primary-600)' }}>{methodIcons[method.methodType] || <FiUser />}</span>
              <span style={{ fontWeight: 700, color: 'var(--neutral-700)', fontSize: 16 }}>{method.methodType.replace('_', ' ')}</span>
              <span style={{ color: 'var(--neutral-500)', fontSize: 15 }}>{method.value}</span>
              <span style={{ color: method.isVerified ? 'var(--success-600)' : 'var(--error-600)', fontWeight: 600, fontSize: 15, marginLeft: 'auto' }}>{method.isVerified ? <><FiCheck /> Verified</> : <><FiAlertCircle /> Unverified</>}</span>
            </div>
          )) : <div className="dashboard-card" style={{ color: 'var(--neutral-400)', padding: '1.1rem 1.3rem', textAlign: 'center' }}><FiAlertCircle /> No recovery methods set up yet.</div>}
        </div>
      </section>
      {showModal && (
        <RecoverySetup initialSetup onClose={() => { setShowModal(false); refreshRecoveryMethods(); }} />
      )}
    </>
  );
} 