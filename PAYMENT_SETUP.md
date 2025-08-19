# 💳 Payment API Setup Guide for Nesto

This guide will help you set up the payment integrations for the Nesto application, including Daraja (M-Pesa), Airtel Money, and crypto auto-conversion.

## 🚀 Quick Start

### 1. Environment Variables Setup

Create a `.env` file in the `src/Nisto_frontend/` directory with the following variables:

```bash
# ===== DARAJA (M-PESA) CONFIGURATION =====
REACT_APP_DARAJA_BASE_URL=https://sandbox.safaricom.co.ke
REACT_APP_DARAJA_CONSUMER_KEY=your_daraja_consumer_key_here
REACT_APP_DARAJA_CONSUMER_SECRET=your_daraja_consumer_secret_here
REACT_APP_DARAJA_PASSKEY=your_daraja_passkey_here
REACT_APP_DARAJA_SHORTCODE=your_daraja_shortcode_here
REACT_APP_DARAJA_ENVIRONMENT=sandbox

# ===== AIRTEL MONEY CONFIGURATION =====
REACT_APP_AIRTEL_BASE_URL=https://openapiuat.airtel.africa
REACT_APP_AIRTEL_CLIENT_ID=your_airtel_client_id_here
REACT_APP_AIRTEL_CLIENT_SECRET=your_airtel_client_secret_here
REACT_APP_AIRTEL_ENVIRONMENT=sandbox

# ===== EXCHANGE RATE API =====
REACT_APP_COINGECKO_API_KEY=your_coingecko_api_key_here

# ===== BACKEND API ENDPOINTS =====
REACT_APP_API_BASE_URL=http://localhost:4943
REACT_APP_BACKEND_CANISTER_ID=your_backend_canister_id_here

# ===== INTERNET IDENTITY =====
REACT_APP_INTERNET_IDENTITY_CANISTER_ID=your_internet_identity_canister_id_here

# ===== ENVIRONMENT =====
NODE_ENV=development
REACT_APP_ENVIRONMENT=development
```

## 🔧 API Provider Setup

### 1. Daraja (M-Pesa) Setup

#### Step 1: Create Daraja Account
1. Go to [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Create an account and verify your email
3. Create a new app for your project

#### Step 2: Get API Credentials
1. In your app dashboard, you'll find:
   - **Consumer Key**: Your app's consumer key
   - **Consumer Secret**: Your app's consumer secret
   - **Shortcode**: Your business shortcode (for testing, use 174379)
   - **Passkey**: Your app's passkey

#### Step 3: Configure Callback URLs
1. Set your callback URL to: `https://your-domain.com/api/daraja/callback`
2. For local development: `http://localhost:3000/api/daraja/callback`

#### Step 4: Test Credentials
```bash
# Test your Daraja credentials
curl -X GET "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials" \
  -H "Authorization: Basic $(echo -n 'YOUR_CONSUMER_KEY:YOUR_CONSUMER_SECRET' | base64)"
```

### 2. Airtel Money Setup

#### Step 1: Create Airtel Developer Account
1. Go to [Airtel Africa Developer Portal](https://developers.airtel.africa/)
2. Create an account and verify your email
3. Create a new application

#### Step 2: Get API Credentials
1. In your app dashboard, you'll find:
   - **Client ID**: Your app's client ID
   - **Client Secret**: Your app's client secret
   - **Environment**: Choose sandbox for testing

#### Step 3: Configure Webhooks
1. Set your webhook URL to: `https://your-domain.com/api/airtel/webhook`
2. For local development: `http://localhost:3000/api/airtel/webhook`

#### Step 4: Test Credentials
```bash
# Test your Airtel credentials
curl -X POST "https://openapiuat.airtel.africa/auth/oauth2/token" \
  -H "Authorization: Basic $(echo -n 'YOUR_CLIENT_ID:YOUR_CLIENT_SECRET' | base64)" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials"
```

### 3. CoinGecko API Setup (Optional)

#### Step 1: Get API Key
1. Go to [CoinGecko API](https://www.coingecko.com/en/api)
2. Create a free account
3. Get your API key (free tier available)

#### Step 2: Configure Rate Limits
- Free tier: 10,000 calls per month
- Pro tier: 100,000 calls per month

## 🏗️ Backend Integration

### 1. Payment Endpoints

The backend should implement these endpoints:

```javascript
// POST /api/daraja/stkpush
// POST /api/airtel/payment
// POST /api/bills/pay
// GET /api/payments/status/:transactionId
// POST /api/payments/record
```

### 2. Callback Handlers

Implement callback handlers for payment confirmations:

```javascript
// POST /api/daraja/callback
// POST /api/airtel/webhook
```

### 3. Database Schema

Create payment records table:

```sql
CREATE TABLE payment_records (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  bill_type VARCHAR(100) NOT NULL,
  bill_provider VARCHAR(100) NOT NULL,
  bill_account VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  crypto_amount DECIMAL(18,8),
  exchange_rate DECIMAL(10,4),
  transaction_id VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🧪 Testing

### 1. Test Phone Numbers

#### M-Pesa Test Numbers (Kenya)
- **254708374149** - Success
- **254708374150** - Insufficient funds
- **254708374151** - User cancelled

#### Airtel Money Test Numbers (Uganda)
- **256700000001** - Success
- **256700000002** - Insufficient funds
- **256700000003** - User cancelled

### 2. Test Amounts

#### M-Pesa Limits
- **Minimum**: KES 1
- **Maximum**: KES 70,000
- **Test Amount**: KES 1,000

#### Airtel Money Limits
- **Minimum**: UGX 100
- **Maximum**: UGX 1,000,000
- **Test Amount**: UGX 10,000

### 3. Test Scenarios

```javascript
// Test M-Pesa payment
const testMPesaPayment = async () => {
  try {
    const result = await PaymentAPIService.darajaSTKPush(
      '254708374149', // Test phone number
      1000, // KES 1,000
      'TEST_ACCOUNT',
      'Test Electricity Payment'
    );
    console.log('M-Pesa payment result:', result);
  } catch (error) {
    console.error('M-Pesa payment failed:', error);
  }
};

// Test Airtel Money payment
const testAirtelPayment = async () => {
  try {
    const result = await PaymentAPIService.airtelMoneyPayment(
      '256700000001', // Test phone number
      10000, // UGX 10,000
      'Test Water Payment'
    );
    console.log('Airtel Money payment result:', result);
  } catch (error) {
    console.error('Airtel Money payment failed:', error);
  }
};

// Test crypto conversion
const testCryptoConversion = async () => {
  try {
    const rate = await PaymentAPIService.getExchangeRate('usdt', 'kes');
    console.log('USDT to KES rate:', rate);
    
    const cryptoAmount = 1000 / rate;
    console.log('USDT amount needed for KES 1,000:', cryptoAmount);
  } catch (error) {
    console.error('Crypto conversion failed:', error);
  }
};
```

## 🔒 Security Considerations

### 1. API Key Security
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly
- Use different keys for development and production

### 2. Payment Validation
- Always validate payment amounts on the server
- Implement webhook signature verification
- Use HTTPS for all API calls
- Implement rate limiting

### 3. Error Handling
- Log all payment errors
- Implement retry mechanisms
- Provide clear error messages to users
- Handle network timeouts gracefully

## 📱 Mobile Money Integration

### 1. M-Pesa Integration Features
- ✅ STK Push (Send Money)
- ✅ STK Push (Pay Bill)
- ✅ Transaction Status Check
- ✅ Callback Handling
- ❌ C2B (Customer to Business)
- ❌ B2C (Business to Customer)

### 2. Airtel Money Integration Features
- ✅ Send Money
- ✅ Pay Bill
- ✅ Transaction Status Check
- ✅ Webhook Handling
- ❌ Collect Money
- ❌ Disburse Money

### 3. Crypto Integration Features
- ✅ Real-time Exchange Rates
- ✅ Auto-conversion
- ✅ Multiple Cryptocurrencies (USDT, USDC)
- ✅ Rate Locking
- ❌ Direct Blockchain Integration
- ❌ Smart Contract Payments

## 🌍 Country-Specific Configuration

### Kenya (KE)
```javascript
const kenyaConfig = {
  currency: 'KES',
  paymentMethods: ['mpesa', 'airtel_money', 'usdt', 'usdc'],
  billProviders: {
    electricity: ['Kenya Power', 'KPLC'],
    water: ['Nairobi Water', 'Mombasa Water'],
    internet: ['Safaricom', 'Airtel', 'Telkom'],
    tv: ['DSTV', 'GOTV', 'StarTimes', 'Zuku']
  },
  phoneFormat: '254XXXXXXXXX'
};
```

### Tanzania (TZ)
```javascript
const tanzaniaConfig = {
  currency: 'TZS',
  paymentMethods: ['mpesa', 'airtel_money', 'usdt', 'usdc'],
  billProviders: {
    electricity: ['Tanzania Electric Supply Company', 'TANESCO'],
    water: ['Dar es Salaam Water and Sewerage Authority'],
    internet: ['Vodacom', 'Airtel', 'Tigo'],
    tv: ['DSTV', 'GOTV', 'StarTimes']
  },
  phoneFormat: '255XXXXXXXXX'
};
```

### Uganda (UG)
```javascript
const ugandaConfig = {
  currency: 'UGX',
  paymentMethods: ['mpesa', 'airtel_money', 'usdt', 'usdc'],
  billProviders: {
    electricity: ['Uganda Electricity Distribution Company', 'UMEME'],
    water: ['National Water and Sewerage Corporation'],
    internet: ['MTN', 'Airtel', 'Uganda Telecom'],
    tv: ['DSTV', 'GOTV', 'StarTimes']
  },
  phoneFormat: '256XXXXXXXXX'
};
```

## 🚀 Production Deployment

### 1. Environment Setup
```bash
# Production environment variables
REACT_APP_DARAJA_ENVIRONMENT=production
REACT_APP_AIRTEL_ENVIRONMENT=production
REACT_APP_ENVIRONMENT=production
```

### 2. SSL Certificate
- Ensure HTTPS is enabled
- Use valid SSL certificates
- Configure proper CORS headers

### 3. Monitoring
- Set up payment monitoring
- Implement alerting for failed payments
- Monitor API rate limits
- Track conversion rates

### 4. Backup Plans
- Implement fallback payment methods
- Use cached exchange rates
- Have manual payment processing options

## 📞 Support

### API Documentation
- [Daraja API Documentation](https://developer.safaricom.co.ke/docs)
- [Airtel Money API Documentation](https://developers.airtel.africa/docs)
- [CoinGecko API Documentation](https://www.coingecko.com/en/api/documentation)

### Contact Information
- **Daraja Support**: support@developer.safaricom.co.ke
- **Airtel Money Support**: developers@airtel.africa
- **CoinGecko Support**: api@coingecko.com

## 🔄 Updates and Maintenance

### Regular Tasks
- [ ] Monitor API rate limits
- [ ] Update exchange rate fallbacks
- [ ] Review security configurations
- [ ] Test payment flows
- [ ] Update API documentation

### Version Updates
- [ ] Check for API version updates
- [ ] Test new features
- [ ] Update integration code
- [ ] Notify users of changes

---

**Note**: This setup guide assumes you have basic knowledge of React, Node.js, and API integrations. For production use, ensure you comply with all local regulations and payment processing requirements.
