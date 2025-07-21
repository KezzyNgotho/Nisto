# 🔔 OTP Service Integration Guide for Nesto

## 🎯 Recommended Services for Kenya/Africa

### 📱 **SMS OTP (Primary Recommendation)**

## 1. **Africa's Talking** 🏆 (Best for Kenya)

**Why Africa's Talking?**
- **Kenyan Company**: Nairobi-based, understands local market
- **Cost**: ~$0.02 per SMS in Kenya (very affordable)
- **Coverage**: Kenya, Uganda, Tanzania, Nigeria, Rwanda, Malawi
- **Delivery**: 95%+ success rate in Kenya
- **Developer-Friendly**: Excellent API, good documentation

### **Setup Steps:**

1. **Create Account**: Go to [africastalking.com](https://africastalking.com)
2. **Get Credentials**:
   - Username: Your app username
   - API Key: Found in dashboard
3. **Add SMS Credits**: Start with $10 for testing

### **Implementation:**

```javascript
// Frontend: Send OTP
const sendSMSOTP = async (phoneNumber) => {
  try {
    const response = await backendService.sendOTP(
      phoneNumber,
      "sms",
      "africas_talking", 
      "recovery_verification"
    );
    
    return response;
  } catch (error) {
    console.error('SMS OTP failed:', error);
    throw error;
  }
};
```

```motoko
// Backend: HTTP Outcall to Africa's Talking
private func sendAfricasTalkingSMS(
  phoneNumber: Text, 
  message: Text
): async Result.Result<Text, Text> {
  let url = "https://api.africastalking.com/version1/messaging";
  let username = "your_username"; // From environment
  let apiKey = "your_api_key";   // From environment
  
  let headers = [
    ("Content-Type", "application/x-www-form-urlencoded"),
    ("apiKey", apiKey)
  ];
  
  let body = "username=" # username # 
             "&to=" # phoneNumber # 
             "&message=" # message;
  
  // HTTP outcall implementation
  // (Will be implemented with IC HTTP outcalls)
  #ok("SMS sent successfully");
};
```

### **Message Template:**
```
Nesto Security Code: {OTP_CODE}
Valid for 10 minutes. 
Do not share this code.
```

---

## 2. **Twilio** (Global Backup)

**Setup:**
1. Account: [twilio.com](https://twilio.com)
2. Get: Account SID, Auth Token, Phone Number
3. Cost: ~$0.04 per SMS in Kenya

```javascript
// Twilio Integration
const sendTwilioSMS = async (phoneNumber, otpCode) => {
  const accountSid = 'your_account_sid';
  const authToken = 'your_auth_token';
  const fromNumber = 'your_twilio_number';
  
  // HTTP outcall to Twilio API
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
  // Implementation with IC HTTP outcalls
};
```

---

### 📧 **Email OTP**

## 1. **Resend** 🏆 (Modern Choice)

**Why Resend?**
- **Free Tier**: 3,000 emails/month
- **Developer-Friendly**: Clean API, excellent docs
- **Deliverability**: High inbox rates
- **Modern**: Built for developers

### **Setup:**
1. Account: [resend.com](https://resend.com)
2. Get API Key from dashboard
3. Verify your domain (optional for testing)

```javascript
// Resend Email OTP
const sendEmailOTP = async (email, otpCode) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@nesto.app',
      to: email,
      subject: 'Nesto Security Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Nesto Security Code</h2>
          <p>Your verification code is:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; color: #1f2937; letter-spacing: 8px;">${otpCode}</span>
          </div>
          <p>This code is valid for 10 minutes.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `
    })
  });
  
  return response.json();
};
```

## 2. **SendGrid** (Enterprise)

**Setup:**
1. Account: [sendgrid.com](https://sendgrid.com)
2. Free Tier: 100 emails/day
3. Get API Key

---

### 💬 **WhatsApp OTP** (Very Popular in Kenya)

## **WhatsApp Business API**

**Why WhatsApp for Kenya?**
- **96% Penetration**: Nearly everyone has WhatsApp
- **High Open Rates**: 98% open rate vs 20% for SMS
- **Rich Messages**: Can send buttons, images
- **Cost-Effective**: ~$0.005 per message

### **Setup via Meta:**

1. **Business Account**: Get WhatsApp Business API access
2. **Phone Number**: Get a business phone number ID
3. **Access Token**: From Meta Developer Console

```javascript
// WhatsApp OTP
const sendWhatsAppOTP = async (phoneNumber, otpCode) => {
  const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "template",
      template: {
        name: "otp_code", // Pre-approved template
        language: { code: "en" },
        components: [{
          type: "body",
          parameters: [{
            type: "text",
            text: otpCode
          }]
        }]
      }
    })
  });
  
  return response.json();
};
```

---

## 🛠️ **Complete Integration Example**

### **1. Backend Integration (Motoko)**

```motoko
// Update sendOTPViaService function with real HTTP outcalls
private func sendOTPViaService(otpRequest: OTPRequest): async Result.Result<Text, Text> {
  switch (otpRequest.service) {
    case ("sms") {
      switch (otpRequest.provider) {
        case ("africas_talking") {
          await sendAfricasTalkingSMS(otpRequest.recipient, 
                                     "Nesto Security Code: " # otpRequest.code # 
                                     ". Valid for 10 minutes. Do not share.");
        };
        case ("twilio") {
          await sendTwilioSMS(otpRequest.recipient, otpRequest.code);
        };
        case (_) { #err("Unsupported SMS provider"); };
      };
    };
    case ("email") {
      switch (otpRequest.provider) {
        case ("resend") {
          await sendResendEmail(otpRequest.recipient, otpRequest.code);
        };
        case ("sendgrid") {
          await sendSendGridEmail(otpRequest.recipient, otpRequest.code);
        };
        case (_) { #err("Unsupported email provider"); };
      };
    };
    case ("whatsapp") {
      await sendWhatsAppMessage(otpRequest.recipient, otpRequest.code);
    };
    case (_) { #err("Unsupported service"); };
  };
};
```

### **2. Frontend Integration (React)**

```jsx
// OTP Component
const OTPVerification = ({ recoveryMethod, onVerified }) => {
  const [otpCode, setOtpCode] = useState('');
  const [otpId, setOtpId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes

  const sendOTP = async () => {
    setIsLoading(true);
    try {
      const service = recoveryMethod.type === 'email' ? 'email' : 'sms';
      const provider = service === 'email' ? 'resend' : 'africas_talking';
      
      const response = await backendService.sendOTP(
        recoveryMethod.value,
        service,
        provider,
        'recovery_verification'
      );
      
      if (response.ok) {
        setOtpId(response.ok.otpId);
        setCountdown(response.ok.expiresIn);
        toast.success(response.ok.message);
      }
    } catch (error) {
      toast.error('Failed to send OTP: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otpId || !otpCode) return;
    
    try {
      const response = await backendService.verifyRecoveryMethod(
        recoveryMethod.id,
        otpId,
        otpCode
      );
      
      if (response.ok) {
        toast.success('Verification successful!');
        onVerified(response.ok);
      }
    } catch (error) {
      toast.error('Invalid OTP code');
    }
  };

  return (
    <div className="otp-verification">
      <h3>Verify {recoveryMethod.type}</h3>
      <p>We've sent a code to {recoveryMethod.value}</p>
      
      <input
        type="text"
        value={otpCode}
        onChange={(e) => setOtpCode(e.target.value)}
        placeholder="Enter 6-digit code"
        maxLength={6}
      />
      
      <button onClick={verifyOTP} disabled={otpCode.length !== 6}>
        Verify Code
      </button>
      
      <button onClick={sendOTP} disabled={isLoading || countdown > 0}>
        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
      </button>
    </div>
  );
};
```

---

## 💰 **Cost Analysis (Kenya Focus)**

### **Monthly Costs for 1,000 Users:**

| Service | Type | Cost per Message | Monthly Cost |
|---------|------|------------------|--------------|
| Africa's Talking | SMS | $0.02 | $20 |
| Twilio | SMS | $0.04 | $40 |
| Resend | Email | Free (3k/month) | $0 |
| SendGrid | Email | $0.0006 | $0.60 |
| WhatsApp | Message | $0.005 | $5 |

**Recommendation**: Start with Africa's Talking SMS + Resend Email = **~$20/month for 1,000 users**

---

## 🚀 **Implementation Priority**

### **Phase 1** (MVP - 2 weeks)
1. ✅ **Africa's Talking SMS**: Primary for Kenya market
2. ✅ **Resend Email**: Free tier, easy setup
3. ✅ **Basic OTP UI**: 6-digit input, resend functionality

### **Phase 2** (Growth - 1 month)
1. **WhatsApp OTP**: High engagement in Kenya
2. **Twilio Backup**: For SMS reliability
3. **Advanced UI**: Better UX, error handling

### **Phase 3** (Scale - 3 months)
1. **Smart Routing**: Choose best service per user
2. **Failover**: Automatic fallback between services
3. **Analytics**: Track delivery rates, costs

---

## 🔧 **Testing Strategy**

### **Local Development:**
```bash
# Test OTP generation
dfx canister call Nesto_backend sendOTP '("+254712345678", "sms", "africas_talking", "recovery")'

# Test OTP verification
dfx canister call Nesto_backend verifyOTP '("otp_1", "123456")'
```

### **Production Setup:**
1. **Environment Variables**: Store API keys securely
2. **Rate Limiting**: Prevent OTP spam
3. **Monitoring**: Track delivery rates
4. **Fallback**: Multiple providers for reliability

---

## 🛡️ **Security Best Practices**

1. **Rate Limiting**: Max 3 OTP requests per 15 minutes
2. **Expiration**: 10-minute OTP validity
3. **Single Use**: OTP becomes invalid after verification
4. **Audit Logging**: Track all OTP activities
5. **Encryption**: Store OTP codes hashed
6. **IP Blocking**: Block suspicious IP addresses

---

## 📊 **Success Metrics**

- **Delivery Rate**: >95% for SMS, >98% for Email
- **Verification Rate**: >80% of sent OTPs verified
- **Time to Verify**: <2 minutes average
- **Cost per Verification**: <$0.03
- **User Satisfaction**: >4.5/5 rating

This comprehensive OTP system will provide secure, reliable, and cost-effective verification for your Kenyan and African user base! 🚀 