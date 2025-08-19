import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  FiMail, 
  FiPhone, 
  FiKey, 
  FiUserCheck, 
  FiCheck, 
  FiAlertCircle,
  FiShield,
  FiLock,
  FiEye,
  FiEyeOff,
  FiClock,
  FiRefreshCw,
  FiDownload,
  FiCopy,
  FiGrid,
  FiSmartphone,
  FiInfo,
  FiAlertTriangle,
  FiCheckCircle,
  FiX,
  FiArrowLeft,
  FiArrowRight,
  FiSave,
  FiUpload,
  FiHelpCircle,
  FiStar,
  FiSettings
} from 'react-icons/fi';
import { format, formatDistanceToNow } from 'date-fns';

const recoveryMethods = [
  { 
    value: 'email', 
    label: 'Email Recovery', 
    icon: FiMail, 
    description: 'Receive recovery code via email',
    security: 'Medium',
    time: '2-5 minutes',
    color: '#3B82F6'
  },
  { 
    value: 'phone', 
    label: 'SMS Recovery', 
    icon: FiPhone, 
    description: 'Receive recovery code via SMS',
    security: 'Medium',
    time: '1-3 minutes',
    color: '#10B981'
  },
  { 
    value: 'authenticator', 
    label: 'Authenticator App', 
    icon: FiSmartphone, 
    description: 'Use your authenticator app code',
    security: 'High',
    time: 'Instant',
    color: '#8B5CF6'
  },
  { 
    value: 'security', 
    label: 'Security Questions', 
    icon: FiKey, 
    description: 'Answer your security questions',
    security: 'Medium',
    time: 'Instant',
    color: '#F59E0B'
  },
  { 
    value: 'backup_phrase', 
    label: 'Recovery Phrase', 
    icon: FiLock, 
    description: 'Enter your 12-word recovery phrase',
    security: 'Very High',
    time: 'Instant',
    color: '#EF4444'
  },
  { 
    value: 'emergency', 
    label: 'Emergency Contact', 
    icon: FiUserCheck, 
    description: 'Contact your emergency backup person',
    security: 'High',
    time: '24-48 hours',
    color: '#F97316'
  },
  { 
    value: 'biometric', 
    label: 'Biometric Recovery', 
    icon: FiShield, 
    description: 'Use fingerprint or face recognition',
    security: 'Very High',
    time: 'Instant',
    color: '#075B5E'
  }
];

const securityQuestionOptions = [
  "What was the name of your first pet?",
  "In what city were you born?",
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "What is your favorite book?",
  "What was the make of your first car?",
  "What is the name of the street you grew up on?",
  "What is your favorite food?",
  "What was your childhood nickname?",
  "What is the name of your best friend from childhood?"
];

export default function EnhancedAccountRecovery({ 
  isOpen = false, 
  onClose, 
  onRecoveryComplete, 
  mode = 'recovery',
  className = '' 
}) {
  const { initiateRecovery, verifyRecovery, completeRecovery, user } = useAuth();
  const { showToast } = useNotification();

  // Core state
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Recovery process state
  const [recoveryRequestId, setRecoveryRequestId] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupPhrase, setBackupPhrase] = useState(Array(12).fill(''));
  const [securityAnswers, setSecurityAnswers] = useState({});
  const [emergencyContactInfo, setEmergencyContactInfo] = useState({
    name: '', email: '', phone: '', relationship: ''
  });
  
  // UI state
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [backupPhraseVisible, setBackupPhraseVisible] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);
  const [progress, setProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Feature detection
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [webAuthnSupported, setWebAuthnSupported] = useState(false);
  
  // Refs
  const codeInputRefs = useRef([]);
  const phraseInputRefs = useRef([]);

  // Check for biometric support
  useEffect(() => {
    const checkBiometricSupport = async () => {
      if (window.PublicKeyCredential) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setBiometricSupported(available);
          setWebAuthnSupported(true);
        } catch (error) {
          console.log('Biometric check failed:', error);
          setBiometricSupported(false);
        }
      }
    };
    
    checkBiometricSupport();
  }, []);

  // Update progress based on step
  useEffect(() => {
    const progressMap = {
      1: 20,  // Method selection
      2: 40,  // Input credentials
      3: 60,  // Verification
      4: 80,  // Completion
      5: 100  // Success
    };
    setProgress(progressMap[step] || 0);
  }, [step]);

  // Validation functions
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone) => {
    const regex = /^\+?[\d\s\-\(\)]{10,}$/;
    return regex.test(phone);
  };

  const validateBackupPhrase = (phrase) => {
    return phrase.every(word => word.trim().length > 0) && phrase.length === 12;
  };

  // Handle method selection
  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setError(null);
    setValidationErrors({});
    
    // Auto-advance for some methods
    if (['biometric', 'authenticator'].includes(method.value)) {
      setStep(3);
    } else {
      setStep(2);
    }
  };

  // Handle recovery initiation
  const handleStartRecovery = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      // Validate input based on method
      const errors = {};
      
      if (selectedMethod.value === 'email' && !validateEmail(identifier)) {
        errors.identifier = 'Please enter a valid email address';
      }
      
      if (selectedMethod.value === 'phone' && !validatePhone(identifier)) {
        errors.identifier = 'Please enter a valid phone number';
      }
      
      if (selectedMethod.value === 'backup_phrase' && !validateBackupPhrase(backupPhrase)) {
        errors.backupPhrase = 'Please enter all 12 words of your recovery phrase';
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      let result;
      
      switch (selectedMethod.value) {
        case 'email':
        case 'phone':
          result = await initiateRecovery(identifier, selectedMethod.value);
          setRecoveryRequestId(result.recoveryRequestId);
          setStep(3); // Verification step
          break;
          
        case 'backup_phrase':
          // Directly verify with backup phrase
          result = await verifyRecovery(null, null, { backupPhrase: backupPhrase.join(' ') });
          if (result.success) {
            setStep(4); // Success step
          }
          break;
          
        case 'security':
          // Load security questions
          result = await initiateRecovery(identifier, 'security');
          setStep(3); // Security questions step
          break;
          
        case 'emergency':
          // Start emergency contact process
          result = await initiateRecovery(emergencyContactInfo.email, 'emergency');
          setStep(4); // Pending approval step
          break;
          
        case 'biometric':
          // Start biometric authentication
          await handleBiometricAuth();
          break;
          
        default:
          throw new Error('Unsupported recovery method');
      }

      if (result?.message) {
        showToast({ 
          message: result.message, 
          type: 'success', 
          icon: <FiCheck /> 
        });
      }

    } catch (error) {
      console.error('Recovery initiation failed:', error);
      setError(error.message || 'Failed to start recovery process');
      setAttemptCount(prev => prev + 1);
      
      // Implement lockout after too many attempts
      if (attemptCount >= 5) {
        setLockoutTime(Date.now() + 15 * 60 * 1000); // 15 minutes
        setError('Too many failed attempts. Please try again in 15 minutes.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle biometric authentication
  const handleBiometricAuth = async () => {
    if (!biometricSupported) {
      throw new Error('Biometric authentication not supported on this device');
    }

    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "Nesto" },
          user: {
            id: new Uint8Array(16),
            name: user?.email || "user@nesto.app",
            displayName: user?.username || "Nesto User"
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          }
        }
      });

      if (credential) {
        setStep(4); // Success
        showToast({ 
          message: 'Biometric authentication successful', 
          type: 'success',
          icon: <FiShield />
        });
      }
    } catch (error) {
      throw new Error('Biometric authentication failed: ' + error.message);
    }
  };

  // Handle verification code input
  const handleCodeInput = (index, value) => {
    if (value.length <= 1) {
      const newCode = verificationCode.split('');
      newCode[index] = value;
      setVerificationCode(newCode.join(''));
      
      // Auto-focus next input
      if (value && index < 5 && codeInputRefs.current[index + 1]) {
        codeInputRefs.current[index + 1].focus();
      }
    }
  };

  // Handle backup phrase input
  const handlePhraseInput = (index, value) => {
    const newPhrase = [...backupPhrase];
    newPhrase[index] = value.toLowerCase().trim();
    setBackupPhrase(newPhrase);
    
    // Auto-focus next input
    if (value && index < 11 && phraseInputRefs.current[index + 1]) {
      phraseInputRefs.current[index + 1].focus();
    }
  };

  // Handle verification
  const handleVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let result;
      
      switch (selectedMethod.value) {
        case 'email':
        case 'phone':
          if (verificationCode.length !== 6) {
            throw new Error('Please enter the complete 6-digit code');
          }
          result = await verifyRecovery(recoveryRequestId, verificationCode);
          break;
          
        case 'security':
          result = await verifyRecovery(recoveryRequestId, null, securityAnswers);
          break;
          
        default:
          throw new Error('Invalid verification method');
      }

      if (result.success) {
        setStep(4);
        showToast({ 
          message: 'Verification successful', 
          type: 'success',
          icon: <FiCheckCircle />
        });
      }
    } catch (error) {
      setError(error.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setStep(1);
    setSelectedMethod(null);
    setIdentifier('');
    setVerificationCode('');
    setBackupPhrase(Array(12).fill(''));
    setSecurityAnswers({});
    setError(null);
    setValidationErrors({});
    setAttemptCount(0);
  };

  // Security score calculation
  const calculateSecurityScore = () => {
    let score = 0;
    if (selectedMethod?.security === 'Very High') score = 100;
    else if (selectedMethod?.security === 'High') score = 80;
    else if (selectedMethod?.security === 'Medium') score = 60;
    else score = 40;
    
    // Reduce score based on attempt count
    score = Math.max(score - (attemptCount * 10), 0);
    
    return score;
  };

  // Check if locked out
  const isLockedOut = lockoutTime && Date.now() < lockoutTime;

  if (!isOpen) return null;

  return (
    <div className={`enhanced-recovery-overlay ${className}`} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        maxHeight: '90vh'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 1.5rem 1rem',
          background: 'linear-gradient(135deg, #075B5E 0%, #1C352D 100%)',
          color: 'white'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FiShield size={20} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  Account Recovery
                </h2>
                <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>
                  Secure access to your account
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                  title="Go back"
                >
                  <FiArrowLeft size={16} />
                </button>
              )}
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  color: 'white',
                  cursor: 'pointer'
                }}
                title="Close"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '4px',
            height: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'white',
              height: '100%',
              width: `${progress}%`,
              transition: 'width 0.3s ease',
              borderRadius: '4px'
            }} />
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '0.5rem',
            fontSize: '0.75rem',
            opacity: 0.8
          }}>
            <span>Step {step} of 4</span>
            <span>{progress}% Complete</span>
          </div>
        </div>

        {/* Content */}
        <div style={{
          padding: '1.5rem',
          maxHeight: 'calc(90vh - 200px)',
          overflowY: 'auto'
        }}>
          {/* Error Banner */}
          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <FiAlertCircle className="text-red-500" />
              <div>
                <div style={{ color: '#DC2626', fontWeight: 600, fontSize: '0.875rem' }}>
                  Recovery Failed
                </div>
                <div style={{ color: '#7F1D1D', fontSize: '0.875rem' }}>
                  {error}
                </div>
              </div>
            </div>
          )}

          {/* Lockout Warning */}
          {isLockedOut && (
            <div style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <FiClock className="text-yellow-500" />
              <div>
                <div style={{ color: '#92400E', fontWeight: 600, fontSize: '0.875rem' }}>
                  Account Temporarily Locked
                </div>
                <div style={{ color: '#78350F', fontSize: '0.875rem' }}>
                  Too many failed attempts. Try again in {Math.ceil((lockoutTime - Date.now()) / 60000)} minutes.
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Method Selection */}
          {step === 1 && (
            <div>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 600 }}>
                Choose Recovery Method
              </h3>
              <p style={{ margin: '0 0 1.5rem 0', color: '#6B7280', fontSize: '0.875rem' }}>
                Select how you'd like to recover access to your account
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recoveryMethods.map((method) => {
                  const IconComponent = method.icon;
                  const isDisabled = method.value === 'biometric' && !biometricSupported;
                  
                  return (
                    <button
                      key={method.value}
                      onClick={() => !isDisabled && handleMethodSelect(method)}
                      disabled={isDisabled}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        border: `1px solid ${isDisabled ? '#E5E7EB' : method.color}`,
                        borderRadius: '12px',
                        background: isDisabled ? '#F9FAFB' : 'white',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        opacity: isDisabled ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!isDisabled) {
                          e.target.style.background = `${method.color}05`;
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = `0 4px 12px ${method.color}20`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isDisabled) {
                          e.target.style.background = 'white';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: `${method.color}15`,
                        color: method.color,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <IconComponent size={20} />
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>
                            {method.label}
                          </h4>
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '12px',
                            background: method.security === 'Very High' ? '#EF444415' :
                                       method.security === 'High' ? '#F59E0B15' :
                                       '#10B98115',
                            color: method.security === 'Very High' ? '#EF4444' :
                                   method.security === 'High' ? '#F59E0B' :
                                   '#10B981',
                            fontWeight: 500
                          }}>
                            {method.security}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#6B7280' }}>
                          {method.description}
                        </p>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                          ⏱️ {method.time}
                        </div>
                      </div>
                      
                      <FiArrowRight size={16} style={{ color: '#9CA3AF' }} />
                    </button>
                  );
                })}
              </div>

              {/* Advanced Options */}
              <div style={{ marginTop: '1.5rem' }}>
                <button
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6B7280',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <FiSettings size={14} />
                  Advanced Options
                  {showAdvancedOptions ? <FiArrowLeft size={14} /> : <FiArrowRight size={14} />}
                </button>

                {showAdvancedOptions && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: '#F9FAFB',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB'
                  }}>
                    <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.75rem' }}>
                      <strong>Security Information:</strong>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.75rem', color: '#6B7280' }}>
                      <li>Recovery attempts are limited to prevent unauthorized access</li>
                      <li>Biometric recovery requires device with fingerprint/face recognition</li>
                      <li>Emergency contact recovery may take 24-48 hours for verification</li>
                      <li>All recovery attempts are logged for security purposes</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Input Method-Specific Information */}
          {step === 2 && selectedMethod && (
            <div>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 600 }}>
                {selectedMethod.label}
              </h3>
              <p style={{ margin: '0 0 1.5rem 0', color: '#6B7280', fontSize: '0.875rem' }}>
                {selectedMethod.description}
              </p>

              <form onSubmit={handleStartRecovery}>
                {/* Email/Phone Input */}
                {['email', 'phone'].includes(selectedMethod.value) && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      {selectedMethod.value === 'email' ? 'Email Address' : 'Phone Number'}
                    </label>
                    <input
                      type={selectedMethod.value === 'email' ? 'email' : 'tel'}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={selectedMethod.value === 'email' ? 'your@email.com' : '+1 (555) 123-4567'}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${validationErrors.identifier ? '#EF4444' : '#D1D5DB'}`,
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        outline: 'none'
                      }}
                      required
                    />
                    {validationErrors.identifier && (
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#EF4444' }}>
                        {validationErrors.identifier}
                      </p>
                    )}
                  </div>
                )}

                {/* Backup Phrase Input */}
                {selectedMethod.value === 'backup_phrase' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem'
                    }}>
                      <label style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#374151'
                      }}>
                        Recovery Phrase (12 words)
                      </label>
                      <button
                        type="button"
                        onClick={() => setBackupPhraseVisible(!backupPhraseVisible)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6B7280',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.75rem'
                        }}
                      >
                        {backupPhraseVisible ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                        {backupPhraseVisible ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem'
                    }}>
                      {backupPhrase.map((word, index) => (
                        <div key={index} style={{ position: 'relative' }}>
                          <span style={{
                            position: 'absolute',
                            left: '0.75rem',
                            top: '0.5rem',
                            fontSize: '0.75rem',
                            color: '#9CA3AF',
                            pointerEvents: 'none'
                          }}>
                            {index + 1}.
                          </span>
                          <input
                            ref={el => phraseInputRefs.current[index] = el}
                            type={backupPhraseVisible ? 'text' : 'password'}
                            value={word}
                            onChange={(e) => handlePhraseInput(index, e.target.value)}
                            placeholder="word"
                            style={{
                              width: '100%',
                              padding: '0.5rem 0.5rem 0.5rem 2rem',
                              border: '1px solid #D1D5DB',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              outline: 'none'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    
                    {validationErrors.backupPhrase && (
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#EF4444' }}>
                        {validationErrors.backupPhrase}
                      </p>
                    )}
                  </div>
                )}

                {/* Emergency Contact Input */}
                {selectedMethod.value === 'emergency' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Emergency Contact Information
                    </label>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <input
                        type="text"
                        placeholder="Contact Name"
                        value={emergencyContactInfo.name}
                        onChange={(e) => setEmergencyContactInfo(prev => ({ ...prev, name: e.target.value }))}
                        style={{
                          padding: '0.75rem',
                          border: '1px solid #D1D5DB',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          outline: 'none'
                        }}
                        required
                      />
                      <input
                        type="email"
                        placeholder="Contact Email"
                        value={emergencyContactInfo.email}
                        onChange={(e) => setEmergencyContactInfo(prev => ({ ...prev, email: e.target.value }))}
                        style={{
                          padding: '0.75rem',
                          border: '1px solid #D1D5DB',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          outline: 'none'
                        }}
                        required
                      />
                      <select
                        value={emergencyContactInfo.relationship}
                        onChange={(e) => setEmergencyContactInfo(prev => ({ ...prev, relationship: e.target.value }))}
                        style={{
                          padding: '0.75rem',
                          border: '1px solid #D1D5DB',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          outline: 'none'
                        }}
                        required
                      >
                        <option value="">Select Relationship</option>
                        <option value="family">Family Member</option>
                        <option value="friend">Trusted Friend</option>
                        <option value="colleague">Colleague</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || isLockedOut}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: isLoading ? '#9CA3AF' : 'linear-gradient(135deg, #075B5E 0%, #1C352D 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isLoading ? (
                    <>
                      <FiRefreshCw className="animate-spin" size={16} />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue
                      <FiArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Step 3: Verification */}
          {step === 3 && (
            <div>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 600 }}>
                Verification Required
              </h3>
              
              {['email', 'phone'].includes(selectedMethod.value) && (
                <div>
                  <p style={{ margin: '0 0 1.5rem 0', color: '#6B7280', fontSize: '0.875rem' }}>
                    Enter the 6-digit code sent to {identifier}
                  </p>
                  
                  <form onSubmit={handleVerification}>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      justifyContent: 'center',
                      marginBottom: '1.5rem'
                    }}>
                      {Array(6).fill(0).map((_, index) => (
                        <input
                          key={index}
                          ref={el => codeInputRefs.current[index] = el}
                          type="text"
                          maxLength="1"
                          value={verificationCode[index] || ''}
                          onChange={(e) => handleCodeInput(index, e.target.value)}
                          style={{
                            width: '48px',
                            height: '48px',
                            textAlign: 'center',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            outline: 'none'
                          }}
                        />
                      ))}
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading || verificationCode.length !== 6}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: (isLoading || verificationCode.length !== 6) ? '#9CA3AF' : 'linear-gradient(135deg, #075B5E 0%, #1C352D 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: (isLoading || verificationCode.length !== 6) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {isLoading ? (
                        <>
                          <FiRefreshCw className="animate-spin" size={16} />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <FiCheck size={16} />
                          Verify Code
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {selectedMethod.value === 'security' && (
                <div>
                  <p style={{ margin: '0 0 1.5rem 0', color: '#6B7280', fontSize: '0.875rem' }}>
                    Answer your security questions to verify your identity
                  </p>
                  
                  <form onSubmit={handleVerification}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                      {securityQuestionOptions.slice(0, 3).map((question, index) => (
                        <div key={index}>
                          <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#374151',
                            marginBottom: '0.5rem'
                          }}>
                            {question}
                          </label>
                          <input
                            type="text"
                            value={securityAnswers[question] || ''}
                            onChange={(e) => setSecurityAnswers(prev => ({ 
                              ...prev, 
                              [question]: e.target.value 
                            }))}
                            placeholder="Your answer..."
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '1px solid #D1D5DB',
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              outline: 'none'
                            }}
                            required
                          />
                        </div>
                      ))}
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: isLoading ? '#9CA3AF' : 'linear-gradient(135deg, #075B5E 0%, #1C352D 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {isLoading ? (
                        <>
                          <FiRefreshCw className="animate-spin" size={16} />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <FiCheck size={16} />
                          Verify Answers
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'white'
              }}>
                <FiCheckCircle size={40} />
              </div>
              
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#065F46' }}>
                Recovery Successful!
              </h3>
              
              <p style={{ margin: '0 0 1.5rem 0', color: '#6B7280', fontSize: '0.875rem' }}>
                Your account has been successfully recovered. You can now access all your features.
              </p>

              {/* Security Score */}
              <div style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <FiShield className="text-green-600" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#065F46' }}>
                    Security Score: {calculateSecurityScore()}/100
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#166534' }}>
                  Your recovery method provided {selectedMethod?.security} security.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={resetForm}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'white',
                    color: '#6B7280',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Try Another Method
                </button>
                <button
                  onClick={() => {
                    onRecoveryComplete && onRecoveryComplete();
                    onClose && onClose();
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Continue to Account
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          background: '#F9FAFB',
          borderTop: '1px solid #E5E7EB',
          fontSize: '0.75rem',
          color: '#6B7280',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <FiInfo size={14} />
            Need help? Contact our support team
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
