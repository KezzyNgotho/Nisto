# AuthSignal Integration Setup Guide

## Overview
This guide will help you set up AuthSignal OTP service integration for the Nsto wallet recovery system.

## Prerequisites
1. AuthSignal account (sign up at https://authsignal.com)
2. API key and Tenant ID from AuthSignal dashboard

## Environment Variables Setup

Create a `.env` file in the `src/Nisto_frontend/` directory with the following variables:

```env
# AuthSignal Configuration
REACT_APP_AUTHSIGNAL_API_KEY=your_authsignal_api_key_here
REACT_APP_AUTHSIGNAL_TENANT_ID=your_tenant_id_here

# Other Environment Variables
REACT_APP_ENVIRONMENT=development
REACT_APP_API_URL=http://localhost:4943
```

## Getting Your AuthSignal Credentials

### 1. Sign up for AuthSignal
- Go to https://authsignal.com
- Create an account
- Complete the onboarding process

### 2. Get API Key
- Navigate to your AuthSignal dashboard
- Go to Settings → API Keys
- Create a new API key with appropriate permissions
- Copy the API key

### 3. Get Tenant ID
- In your AuthSignal dashboard
- Go to Settings → General
- Copy your Tenant ID

### 4. Configure OTP Templates
- Go to Templates → Email/SMS
- Create custom templates for recovery codes
- Use the following template variables:
  - `{{code}}` - The OTP code
  - `{{expires_in}}` - Expiry time
  - `{{service_name}}` - Your service name

## API Endpoints Used

The integration uses the following AuthSignal API endpoints:

### Email OTP
```
POST https://eu.api.authsignal.com/v1/otp/email
```

### SMS OTP
```
POST https://eu.api.authsignal.com/v1/otp/sms
```

### Verify OTP
```
POST https://eu.api.authsignal.com/v1/otp/verify
```

### Resend OTP
```
POST https://eu.api.authsignal.com/v1/otp/resend
```

## Request/Response Examples

### Email OTP Request
```json
{
  "email": "user@example.com",
  "action": "recovery",
  "redirectUrl": "https://your-app.com",
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.1",
  "custom": {
    "purpose": "recovery",
    "service": "nesto-wallet"
  }
}
```

### Email OTP Response
```json
{
  "token": "authsignal_token_here",
  "expiresAt": "2024-01-01T12:00:00Z",
  "success": true
}
```

### Verify OTP Request
```json
{
  "token": "authsignal_token_here",
  "code": "123456",
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.1"
}
```

### Verify OTP Response
```json
{
  "success": true,
  "userId": "user_id_here",
  "sessionId": "session_id_here"
}
```

## Security Features

### Rate Limiting
- Built-in rate limiting to prevent abuse
- Configurable limits per user/IP
- Automatic blocking of suspicious activity

### IP Tracking
- Automatic IP address detection
- Geolocation-based security
- Suspicious activity monitoring

### User Agent Tracking
- Browser fingerprinting
- Device identification
- Session management

## Development Mode

In development mode, the service falls back to mock OTP functionality:
- Fixed OTP code: `123456`
- Mock API responses
- Console logging for debugging

## Testing

### Test Email OTP
1. Use a valid email address
2. Check console for mock OTP code
3. Enter `123456` as the verification code

### Test SMS OTP
1. Use a valid phone number format
2. Check console for mock OTP code
3. Enter `123456` as the verification code

## Production Deployment

### 1. Update Environment Variables
```env
REACT_APP_AUTHSIGNAL_API_KEY=your_production_api_key
REACT_APP_AUTHSIGNAL_TENANT_ID=your_production_tenant_id
REACT_APP_ENVIRONMENT=production
```

### 2. Configure AuthSignal Dashboard
- Set up production templates
- Configure rate limits
- Set up monitoring and alerts

### 3. Test Production Flow
- Test with real email addresses
- Test with real phone numbers
- Verify rate limiting works
- Check security monitoring

## Troubleshooting

### Common Issues

#### 1. API Key Invalid
- Verify API key is correct
- Check API key permissions
- Ensure key is not expired

#### 2. Tenant ID Invalid
- Verify Tenant ID is correct
- Check tenant configuration
- Ensure tenant is active

#### 3. Rate Limiting
- Check rate limit configuration
- Wait for rate limit reset
- Contact AuthSignal support if needed

#### 4. OTP Not Received
- Check spam folder for emails
- Verify phone number format
- Check AuthSignal delivery logs

### Debug Mode
Enable debug logging by setting:
```env
REACT_APP_DEBUG=true
```

This will show detailed API requests and responses in the console.

## Support

- AuthSignal Documentation: https://docs.authsignal.com
- AuthSignal Support: support@authsignal.com
- Nesto Wallet Issues: Create an issue in the repository

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Enable rate limiting** in production
4. **Monitor usage** through AuthSignal dashboard
5. **Regular security audits** of OTP implementation
6. **Use HTTPS** for all API communications
7. **Implement proper error handling** for failed requests
8. **Log security events** for monitoring

## Cost Considerations

- AuthSignal charges per OTP sent
- Monitor usage through dashboard
- Set up billing alerts
- Consider implementing local rate limiting to reduce costs
