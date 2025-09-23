import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import OTPService from '../services/OTPService';
import { 
  FiX, 
  FiMail, 
  FiPhone, 
  FiShield, 
  FiCheck, 
  FiRefreshCw,
  FiArrowLeft,
  FiClock,
  FiAlertCircle,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import './AddRecoveryModal.scss';

const recoveryMethods = [
  { 
    id: 'email', 
    name: 'Email Recovery', 
    icon: FiMail, 
    description: 'Receive recovery codes via email',
    color: '#3B82F6'
  },
  { 
    id: 'phone', 
    name: 'SMS Recovery', 
    icon: FiPhone, 
    description: 'Receive recovery codes via SMS',
    color: '#10B981'
  },
  { 
    id: 'authenticator', 
    name: 'Authenticator App', 
    icon: FiShield, 
    description: 'Use your authenticator app',
    color: '#8B5CF6'
  }
];

const AddRecoveryModal = ({ isOpen, onClose, onSuccess }) => {
  const { theme } = useTheme();
  const { addRecoveryMethod } = useAuth();
  const { showToast } = useNotification();
  const otpService = OTPService;

  // State management
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [identifier, setIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpRequestId, setOtpRequestId] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState({ minutes: 0, seconds: 0 });
  const [showOtp, setShowOtp] = useState(false);

  // Refs
  const otpInputRefs = useRef([]);

  // Reset modal when opened/closed
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedMethod(null);
      setIdentifier('');
      setOtpCode('');
      setError(null);
      setOtpRequestId(null);
      setTimeRemaining({ minutes: 0, seconds: 0 });
    }
  }, [isOpen]);

  // Timer for OTP expiry
  useEffect(() => {
    let interval;
    if (otpRequestId && timeRemaining.minutes >= 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 };
          } else if (prev.minutes > 0) {
            return { minutes: prev.minutes - 1, seconds: 59 };
          } else {
            return { minutes: 0, seconds: 0 };
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpRequestId, timeRemaining]);

  // Handle method selection
  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setError(null);
    setStep(2);
  };

  // Handle identifier input and OTP generation
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate identifier
      if (selectedMethod.id === 'email' && !otpService.validateEmail(identifier)) {
        setError('Please enter a valid email address');
        return;
      }
      
      if (selectedMethod.id === 'phone' && !otpService.validatePhoneNumber(identifier)) {
        setError('Please enter a valid phone number');
        return;
      }

      // Generate OTP
      let result;
      if (selectedMethod.id === 'email') {
        result = await otpService.generateEmailOTP(identifier, 'recovery');
      } else if (selectedMethod.id === 'phone') {
        result = await otpService.generateSMSOTP(identifier, 'recovery');
      } else {
        // For authenticator, skip OTP step
        await handleAddRecoveryMethod();
        return;
      }

      if (result.success) {
        setOtpRequestId(result.requestId);
        setTimeRemaining({ minutes: 5, seconds: 0 });
        setStep(3);
        showToast({
          message: result.message,
          type: 'success',
          icon: <FiCheck />
        });
      }
    } catch (error) {
      setError(error.message);
      showToast({
        message: error.message,
        type: 'error',
        icon: <FiAlertCircle />
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification and recovery method addition
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (otpCode.length !== 6) {
        setError('Please enter the complete 6-digit code');
        return;
      }

      // Verify OTP
      const verifyResult = await otpService.verifyOTP(otpRequestId, otpCode, selectedMethod.id);
      
      if (verifyResult.success && verifyResult.valid) {
        await handleAddRecoveryMethod();
      } else {
        setError('Invalid OTP code. Please try again.');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add recovery method to backend
  const handleAddRecoveryMethod = async () => {
    try {
      const result = await addRecoveryMethod(selectedMethod.id, identifier);
      
      showToast({
        message: `${selectedMethod.name} recovery method added successfully!`,
        type: 'success',
        icon: <FiCheck />
      });

      if (onSuccess) {
        onSuccess(result);
      }
      
      onClose();
    } catch (error) {
      setError(error.message);
      showToast({
        message: error.message,
        type: 'error',
        icon: <FiAlertCircle />
      });
    }
  };

  // Handle OTP input
  const handleOtpInput = (index, value) => {
    if (value.length <= 1) {
      const newCode = otpCode.split('');
      newCode[index] = value;
      setOtpCode(newCode.join(''));
      
      // Auto-focus next input
      if (value && index < 5 && otpInputRefs.current[index + 1]) {
        otpInputRefs.current[index + 1].focus();
      }
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await otpService.resendOTP(otpRequestId, selectedMethod.id);
      
      if (result.success) {
        setTimeRemaining({ minutes: 5, seconds: 0 });
        showToast({
          message: 'OTP resent successfully',
          type: 'success',
          icon: <FiRefreshCw />
        });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to previous step
  const handleGoBack = () => {
    if (step === 3) {
      setStep(2);
      setOtpCode('');
      setOtpRequestId(null);
    } else if (step === 2) {
      setStep(1);
      setIdentifier('');
      setSelectedMethod(null);
    }
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="add-recovery-modal-overlay" onClick={onClose}>
      <div 
        className="add-recovery-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: theme.colors.background?.secondary || theme.colors.background,
          borderColor: theme.colors.border?.primary || theme.colors.border
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{
          borderBottomColor: theme.colors.border?.primary || theme.colors.border
        }}>
          <div className="header-content">
            <div className="header-icon" style={{ backgroundColor: theme.colors.primary }}>
              <FiShield />
            </div>
            <div className="header-text">
              <h2 style={{ color: theme.colors.text?.primary || theme.colors.text }}>
                Add Recovery Method
              </h2>
              <p style={{ color: theme.colors.text?.secondary || theme.colors.text }}>
                Secure your account with a recovery option
              </p>
            </div>
          </div>
          
          <div className="header-actions">
            {step > 1 && (
              <button 
                className="back-btn"
                onClick={handleGoBack}
                style={{
                  backgroundColor: theme.colors.background?.primary || theme.colors.background,
                  color: theme.colors.text?.secondary || theme.colors.text
                }}
              >
                <FiArrowLeft />
              </button>
            )}
            <button 
              className="close-btn"
              onClick={onClose}
              style={{
                backgroundColor: theme.colors.background?.primary || theme.colors.background,
                color: theme.colors.text?.secondary || theme.colors.text
              }}
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Error Display */}
          {error && (
            <div className="error-banner" style={{
              backgroundColor: theme.colors.error + '10',
              borderColor: theme.colors.error,
              color: theme.colors.error
            }}>
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Method Selection */}
          {step === 1 && (
            <div className="step-content">
              <h3 style={{ color: theme.colors.text?.primary || theme.colors.text }}>
                Choose Recovery Method
              </h3>
              <p style={{ color: theme.colors.text?.secondary || theme.colors.text }}>
                Select how you'd like to receive recovery codes
              </p>

              <div className="method-options">
                {recoveryMethods.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <button
                      key={method.id}
                      className="method-option"
                      onClick={() => handleMethodSelect(method)}
                      style={{
                        borderColor: theme.colors.border?.primary || theme.colors.border,
                        backgroundColor: theme.colors.background?.primary || theme.colors.background
                      }}
                    >
                      <div 
                        className="method-icon"
                        style={{ backgroundColor: method.color + '15', color: method.color }}
                      >
                        <IconComponent />
                      </div>
                      <div className="method-info">
                        <h4 style={{ color: theme.colors.text?.primary || theme.colors.text }}>
                          {method.name}
                        </h4>
                        <p style={{ color: theme.colors.text?.secondary || theme.colors.text }}>
                          {method.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Identifier Input */}
          {step === 2 && selectedMethod && (
            <div className="step-content">
              <h3 style={{ color: theme.colors.text?.primary || theme.colors.text }}>
                {selectedMethod.name}
              </h3>
              <p style={{ color: theme.colors.text?.secondary || theme.colors.text }}>
                {selectedMethod.description}
              </p>

              <form onSubmit={handleSendOTP}>
                <div className="input-group">
                  <label style={{ color: theme.colors.text?.primary || theme.colors.text }}>
                    {selectedMethod.id === 'email' ? 'Email Address' : 'Phone Number'}
                  </label>
                  <input
                    type={selectedMethod.id === 'email' ? 'email' : 'tel'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      selectedMethod.id === 'email' 
                        ? 'your@email.com' 
                        : '+1 (555) 123-4567'
                    }
                    style={{
                      backgroundColor: theme.colors.background?.primary || theme.colors.background,
                      borderColor: theme.colors.border?.primary || theme.colors.border,
                      color: theme.colors.text?.primary || theme.colors.text
                    }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="primary-btn"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.white
                  }}
                >
                  {isLoading ? (
                    <>
                      <FiRefreshCw className="spinning" />
                      Sending...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Step 3: OTP Verification */}
          {step === 3 && selectedMethod && (
            <div className="step-content">
              <h3 style={{ color: theme.colors.text?.primary || theme.colors.text }}>
                Enter Verification Code
              </h3>
              <p style={{ color: theme.colors.text?.secondary || theme.colors.text }}>
                We sent a 6-digit code to {selectedMethod.id === 'email' ? identifier : otpService.formatPhoneNumber(identifier)}
              </p>

              <form onSubmit={handleVerifyOTP}>
                <div className="otp-inputs">
                  {Array(6).fill(0).map((_, index) => (
                    <input
                      key={index}
                      ref={el => otpInputRefs.current[index] = el}
                      type="text"
                      maxLength="1"
                      value={otpCode[index] || ''}
                      onChange={(e) => handleOtpInput(index, e.target.value)}
                      style={{
                        backgroundColor: theme.colors.background?.primary || theme.colors.background,
                        borderColor: theme.colors.border?.primary || theme.colors.border,
                        color: theme.colors.text?.primary || theme.colors.text
                      }}
                    />
                  ))}
                </div>

                {/* Timer */}
                {timeRemaining.minutes > 0 && (
                  <div className="timer" style={{ color: theme.colors.text?.secondary || theme.colors.text }}>
                    <FiClock />
                    <span>
                      {timeRemaining.minutes}:{timeRemaining.seconds.toString().padStart(2, '0')} remaining
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="primary-btn"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.white
                  }}
                >
                  {isLoading ? (
                    <>
                      <FiRefreshCw className="spinning" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading || timeRemaining.minutes > 0}
                  className="resend-btn"
                  style={{
                    color: theme.colors.primary
                  }}
                >
                  Resend Code
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddRecoveryModal;
