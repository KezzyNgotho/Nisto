// OTP Service for SMS and Email Verification using Backend Service
import BackendService from './BackendService';

class OTPService {
  constructor() {
    this.backendService = new BackendService();
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  // Generate OTP for email using Backend Service (which calls AuthSignal)
  async generateEmailOTP(email, purpose = 'recovery') {
    try {
      console.log('📧 Generating email OTP for:', email);
      
      const result = await this.backendService.generateEmailOTP(email, purpose);
      console.log('✅ Email OTP generated successfully:', result);
      
      return {
        success: true,
        requestId: result.requestId || result.token,
        expiry: result.expiry || result.expiresAt,
        message: result.message || 'OTP sent to your email address'
      };
    } catch (error) {
      console.error('❌ Email OTP generation failed:', error);
      throw new Error(`Failed to send email OTP: ${error.message}`);
    }
  }

  // Generate OTP for SMS using Backend Service (which calls AuthSignal)
  async generateSMSOTP(phoneNumber, purpose = 'recovery') {
    try {
      console.log('📱 Generating SMS OTP for:', phoneNumber);
      
      const result = await this.backendService.generateSMSOTP(phoneNumber, purpose);
      console.log('✅ SMS OTP generated successfully:', result);
      
      return {
        success: true,
        requestId: result.requestId || result.token,
        expiry: result.expiry || result.expiresAt,
        message: result.message || 'OTP sent to your phone number'
      };
    } catch (error) {
      console.error('❌ SMS OTP generation failed:', error);
      throw new Error(`Failed to send SMS OTP: ${error.message}`);
    }
  }

  // Verify OTP using Backend Service (which calls AuthSignal)
  async verifyOTP(requestId, otpCode, method = 'email') {
    try {
      console.log('🔍 Verifying OTP:', { requestId, method, codeLength: otpCode.length });
      
      const result = await this.backendService.verifyOTP(requestId, otpCode, method);
      console.log('✅ OTP verification result:', result);
      
      return {
        success: true,
        valid: result.valid || result.success,
        message: result.message || (result.valid ? 'OTP verified successfully' : 'Invalid OTP code'),
        userId: result.userId,
        sessionId: result.sessionId
      };
    } catch (error) {
      console.error('❌ OTP verification failed:', error);
      throw new Error(`Failed to verify OTP: ${error.message}`);
    }
  }

  // Resend OTP using AuthSignal
  async resendOTP(requestId, method = 'email') {
    try {
      console.log('🔄 Resending OTP:', { requestId, method });
      
      const response = await fetch(`${this.baseUrl}/otp/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Tenant-ID': this.tenantId
        },
        body: JSON.stringify({
          token: requestId,
          userAgent: navigator.userAgent,
          ipAddress: await this.getClientIP()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ OTP resent successfully:', result);
      
      return {
        success: true,
        requestId: result.token,
        expiry: result.expiresAt,
        message: 'OTP resent successfully'
      };
    } catch (error) {
      console.error('❌ OTP resend failed:', error);
      
      // Fallback to mock resend for development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Using mock OTP resend for development');
        return this.resendMockOTP(requestId, method);
      }
      
      throw new Error(`Failed to resend OTP: ${error.message}`);
    }
  }

  // Mock OTP generation for development
  generateMockOTP(identifier, method) {
    const requestId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiry = Date.now() + (5 * 60 * 1000); // 5 minutes
    
    // Store mock OTP in localStorage for development
    const mockOTP = '123456'; // Fixed OTP for development
    localStorage.setItem(`mock_otp_${requestId}`, mockOTP);
    localStorage.setItem(`mock_otp_expiry_${requestId}`, expiry.toString());
    
    console.log(`🔄 Mock ${method.toUpperCase()} OTP generated:`, mockOTP);
    
    return {
      success: true,
      requestId: requestId,
      expiry: expiry,
      message: `Mock ${method.toUpperCase()} OTP sent (check console for code: ${mockOTP})`
    };
  }

  // Mock OTP verification for development
  verifyMockOTP(otpCode) {
    const valid = otpCode === '123456';
    console.log('🔄 Mock OTP verification:', { code: otpCode, valid });
    
    return {
      success: true,
      valid: valid,
      message: valid ? 'Mock OTP verified successfully' : 'Invalid mock OTP code'
    };
  }

  // Mock OTP resend for development
  resendMockOTP(requestId, method) {
    const expiry = Date.now() + (5 * 60 * 1000); // 5 minutes
    
    console.log(`🔄 Mock ${method.toUpperCase()} OTP resent`);
    
    return {
      success: true,
      requestId: requestId,
      expiry: expiry,
      message: `Mock ${method.toUpperCase()} OTP resent successfully`
    };
  }

  // Validate phone number format
  validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phoneNumber);
  }

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Format phone number for display
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phoneNumber; // Return original if can't format
  }

  // Get OTP expiry time remaining
  getTimeRemaining(expiry) {
    const now = Date.now();
    const remaining = expiry - now;
    
    if (remaining <= 0) {
      return { expired: true, minutes: 0, seconds: 0 };
    }
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    return { expired: false, minutes, seconds };
  }

  // Get client IP address
  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Failed to get client IP:', error);
      return '127.0.0.1'; // Fallback to localhost
    }
  }

  // Rate limiting check using AuthSignal
  async checkRateLimit(identifier, method = 'email') {
    try {
      const response = await fetch(`${this.baseUrl}/rate-limit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Tenant-ID': this.tenantId
        },
        body: JSON.stringify({
          identifier: identifier,
          action: 'recovery',
          userAgent: navigator.userAgent,
          ipAddress: await this.getClientIP()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        allowed: result.allowed,
        remaining: result.remaining,
        resetTime: result.resetTime
      };
    } catch (error) {
      console.error('❌ Rate limit check failed:', error);
      
      // Allow in development mode
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          allowed: true,
          remaining: 10,
          resetTime: Date.now() + (60 * 60 * 1000) // 1 hour
        };
      }
      
      throw new Error(`Failed to check rate limit: ${error.message}`);
    }
  }

  // Get AuthSignal user actions/history
  async getUserActions(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/actions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Tenant-ID': this.tenantId
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        actions: result.actions || []
      };
    } catch (error) {
      console.error('❌ Failed to get user actions:', error);
      throw new Error(`Failed to get user actions: ${error.message}`);
    }
  }

  // Track user action for security monitoring
  async trackAction(userId, action, metadata = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Tenant-ID': this.tenantId
        },
        body: JSON.stringify({
          userId: userId,
          action: action,
          userAgent: navigator.userAgent,
          ipAddress: await this.getClientIP(),
          metadata: {
            ...metadata,
            service: 'nesto-wallet',
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        actionId: result.actionId
      };
    } catch (error) {
      console.error('❌ Failed to track action:', error);
      // Don't throw error for tracking failures - it shouldn't break the main flow
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const otpService = new OTPService();

export default otpService;
