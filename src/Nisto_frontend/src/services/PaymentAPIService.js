// Payment API Service for Nesto
// Integrates with Daraja (M-Pesa), Airtel Money, and other local payment providers

class PaymentAPIService {
  // Configuration
  static config = {
    daraja: {
      baseUrl: import.meta.env.VITE_DARAJA_BASE_URL || 'https://sandbox.safaricom.co.ke',
      consumerKey: import.meta.env.VITE_DARAJA_CONSUMER_KEY,
      consumerSecret: import.meta.env.VITE_DARAJA_CONSUMER_SECRET,
      passkey: import.meta.env.VITE_DARAJA_PASSKEY,
      shortcode: import.meta.env.VITE_DARAJA_SHORTCODE,
      environment: import.meta.env.VITE_DARAJA_ENVIRONMENT || 'sandbox'
    },
    airtel: {
      baseUrl: import.meta.env.VITE_AIRTEL_BASE_URL || 'https://openapiuat.airtel.africa',
      clientId: import.meta.env.VITE_AIRTEL_CLIENT_ID,
      clientSecret: import.meta.env.VITE_AIRTEL_CLIENT_SECRET,
      environment: import.meta.env.VITE_AIRTEL_ENVIRONMENT || 'sandbox'
    },
    exchangeRates: {
      coingecko: 'https://api.coingecko.com/api/v3',
      fallbackRates: {
        'usdt': { 'kes': 3200, 'usd': 1.0, 'eur': 0.85, 'ngn': 1500, 'ghs': 12.5 },
        'usdc': { 'kes': 3200, 'usd': 1.0, 'eur': 0.85, 'ngn': 1500, 'ghs': 12.5 },
        'btc': { 'kes': 96000000, 'usd': 30000, 'eur': 25500, 'ngn': 45000000, 'ghs': 375000 },
        'eth': { 'kes': 6400000, 'usd': 2000, 'eur': 1700, 'ngn': 3000000, 'ghs': 25000 }
      }
    }
  };

  // ===== DARAJA (M-PESA) INTEGRATION =====

  // Get Daraja access token
  static async getDarajaAccessToken() {
    try {
      const credentials = btoa(`${this.config.daraja.consumerKey}:${this.config.daraja.consumerSecret}`);
      
      const response = await fetch(`${this.config.daraja.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get Daraja access token');
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Daraja access token error:', error);
      throw error;
    }
  }

  // Daraja STK Push (M-Pesa payment)
  static async darajaSTKPush(phoneNumber, amount, accountReference, description) {
    try {
      const accessToken = await this.getDarajaAccessToken();
      
      // Format phone number (remove + and add country code if needed)
      let formattedPhone = phoneNumber.replace('+', '');
      if (!formattedPhone.startsWith('254')) {
        formattedPhone = `254${formattedPhone.substring(formattedPhone.length - 9)}`;
      }

      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = btoa(`${this.config.daraja.shortcode}${this.config.daraja.passkey}${timestamp}`);

      const payload = {
        BusinessShortCode: this.config.daraja.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: this.config.daraja.shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${window.location.origin}/api/daraja/callback`,
        AccountReference: accountReference,
        TransactionDesc: description
      };

      const response = await fetch(`${this.config.daraja.baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('STK Push failed');
      }

      const result = await response.json();
      
      // Check if STK push was successful
      if (result.ResponseCode === '0') {
        return {
          success: true,
          checkoutRequestID: result.CheckoutRequestID,
          merchantRequestID: result.MerchantRequestID,
          message: 'STK Push sent successfully. Please check your phone to complete payment.'
        };
      } else {
        throw new Error(result.ResponseDescription || 'STK Push failed');
      }
    } catch (error) {
      console.error('Daraja STK Push error:', error);
      throw error;
    }
  }

  // Check Daraja transaction status
  static async checkDarajaTransactionStatus(checkoutRequestID) {
    try {
      const accessToken = await this.getDarajaAccessToken();
      
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = btoa(`${this.config.daraja.shortcode}${this.config.daraja.passkey}${timestamp}`);

      const payload = {
        BusinessShortCode: this.config.daraja.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID
      };

      const response = await fetch(`${this.config.daraja.baseUrl}/mpesa/stkpushquery/v1/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to check transaction status');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Daraja transaction status check error:', error);
      throw error;
    }
  }

  // ===== AIRTEL MONEY INTEGRATION =====

  // Get Airtel access token
  static async getAirtelAccessToken() {
    try {
      const credentials = btoa(`${this.config.airtel.clientId}:${this.config.airtel.clientSecret}`);
      
      const response = await fetch(`${this.config.airtel.baseUrl}/auth/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error('Failed to get Airtel access token');
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Airtel access token error:', error);
      throw error;
    }
  }

  // Airtel Money payment
  static async airtelMoneyPayment(phoneNumber, amount, description) {
    try {
      const accessToken = await this.getAirtelAccessToken();
      
      // Format phone number
      let formattedPhone = phoneNumber.replace('+', '');
      if (!formattedPhone.startsWith('256')) {
        formattedPhone = `256${formattedPhone.substring(formattedPhone.length - 9)}`;
      }

      const payload = {
        reference: `BILL_${Date.now()}`,
        subscriber: {
          country: 'UG',
          currency: 'UGX',
          msisdn: formattedPhone
        },
        transaction: {
          amount: Math.round(amount),
          country: 'UG',
          currency: 'UGX',
          id: `TXN_${Date.now()}`
        }
      };

      const response = await fetch(`${this.config.airtel.baseUrl}/merchant/v1/payments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Country': 'UG',
          'X-Currency': 'UGX'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Airtel Money payment failed');
      }

      const result = await response.json();
      
      if (result.status && result.status.success) {
        return {
          success: true,
          transactionId: result.data.transaction.id,
          message: 'Payment initiated successfully. Please check your phone to complete payment.'
        };
      } else {
        throw new Error(result.status.message || 'Airtel Money payment failed');
      }
    } catch (error) {
      console.error('Airtel Money error:', error);
      throw error;
    }
  }

  // ===== EXCHANGE RATE SERVICES =====

  // Get real-time exchange rate from CoinGecko
  static async getExchangeRate(fromCurrency, toCurrency) {
    try {
      // Try CoinGecko first
      const response = await fetch(
        `${this.config.exchangeRates.coingecko}/simple/price?ids=${fromCurrency.toLowerCase()}&vs_currencies=${toCurrency.toLowerCase()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const rate = data[fromCurrency.toLowerCase()]?.[toCurrency.toLowerCase()];
        if (rate) {
          return rate;
        }
      }
      
      // Fallback to cached rates
      return this.getFallbackExchangeRate(fromCurrency, toCurrency);
    } catch (error) {
      console.error('Exchange rate error:', error);
      return this.getFallbackExchangeRate(fromCurrency, toCurrency);
    }
  }

  // Get fallback exchange rate
  static getFallbackExchangeRate(fromCurrency, toCurrency) {
    const fallbackRates = this.config.exchangeRates.fallbackRates;
    return fallbackRates[fromCurrency.toLowerCase()]?.[toCurrency.toLowerCase()] || 1;
  }

  // ===== BILL PAYMENT INTEGRATION =====

  // Process bill payment with auto-conversion
  static async payBill(billData) {
    try {
      const {
        billType,
        billProvider,
        billAccount,
        amount,
        currency,
        paymentMethod,
        cryptoAmount,
        exchangeRate,
        location
      } = billData;

      // Validate payment data
      if (!billType || !billProvider || !billAccount || !amount || !paymentMethod) {
        throw new Error('Missing required payment information');
      }

      // Process based on payment method
      let paymentResult;
      
      if (paymentMethod === 'mpesa') {
        paymentResult = await this.darajaSTKPush(
          billAccount,
          amount,
          billProvider,
          `${billType} Payment`
        );
      } else if (paymentMethod === 'airtel_money') {
        paymentResult = await this.airtelMoneyPayment(
          billAccount,
          amount,
          `${billType} Payment`
        );
      } else if (['usdt', 'usdc'].includes(paymentMethod)) {
        // Crypto payment with auto-conversion
        paymentResult = await this.processCryptoPayment({
          cryptoAmount,
          exchangeRate,
          billData
        });
      } else {
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }

      // Record payment in backend
      await this.recordPayment({
        ...billData,
        paymentResult,
        status: 'processing'
      });

      return paymentResult;
    } catch (error) {
      console.error('Bill payment error:', error);
      throw error;
    }
  }

  // Process crypto payment with auto-conversion
  static async processCryptoPayment({ cryptoAmount, exchangeRate, billData }) {
    try {
      // Validate crypto payment data
      if (!cryptoAmount || !exchangeRate) {
        throw new Error('Missing crypto conversion data');
      }

      // Simulate crypto payment processing
      // In production, this would integrate with actual crypto payment processors
      const paymentResult = {
        success: true,
        transactionId: `CRYPTO_${Date.now()}`,
        cryptoAmount,
        exchangeRate,
        convertedAmount: billData.amount,
        message: `Payment of ${cryptoAmount} ${billData.paymentMethod.toUpperCase()} processed successfully`
      };

      return paymentResult;
    } catch (error) {
      console.error('Crypto payment error:', error);
      throw error;
    }
  }

  // Record payment in backend
  static async recordPayment(paymentData) {
    try {
      const response = await fetch('/api/payments/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error('Failed to record payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Payment recording error:', error);
      // Don't throw error here as payment might still be successful
    }
  }

  // ===== PAYMENT STATUS CHECKING =====

  // Check payment status
  static async checkPaymentStatus(transactionId, paymentMethod) {
    try {
      if (paymentMethod === 'mpesa') {
        return await this.checkDarajaTransactionStatus(transactionId);
      } else if (paymentMethod === 'airtel_money') {
        return await this.checkAirtelTransactionStatus(transactionId);
      } else {
        // For crypto payments, check backend
        const response = await fetch(`/api/payments/status/${transactionId}`);
        if (response.ok) {
          return await response.json();
        }
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      throw error;
    }
  }

  // Check Airtel transaction status
  static async checkAirtelTransactionStatus(transactionId) {
    try {
      const accessToken = await this.getAirtelAccessToken();
      
      const response = await fetch(`${this.config.airtel.baseUrl}/standard/v1/payments/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Country': 'UG',
          'X-Currency': 'UGX'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check Airtel transaction status');
      }

      return await response.json();
    } catch (error) {
      console.error('Airtel transaction status check error:', error);
      throw error;
    }
  }

  // ===== UTILITY FUNCTIONS =====

  // Format phone number for different countries
  static formatPhoneNumber(phoneNumber, countryCode) {
    let formatted = phoneNumber.replace(/\D/g, '');
    
    const countryFormats = {
      'KE': { prefix: '254', length: 12 },
      'TZ': { prefix: '255', length: 12 },
      'UG': { prefix: '256', length: 12 },
      'NG': { prefix: '234', length: 13 },
      'GH': { prefix: '233', length: 12 }
    };

    const format = countryFormats[countryCode];
    if (format) {
      if (formatted.startsWith('0')) {
        formatted = formatted.substring(1);
      }
      if (!formatted.startsWith(format.prefix)) {
        formatted = `${format.prefix}${formatted}`;
      }
    }

    return formatted;
  }

  // Validate payment amount
  static validateAmount(amount, currency) {
    const minAmounts = {
      'KES': 1,
      'UGX': 100,
      'TZS': 100,
      'NGN': 50,
      'GHS': 0.1
    };

    const maxAmounts = {
      'KES': 70000,
      'UGX': 1000000,
      'TZS': 1000000,
      'NGN': 100000,
      'GHS': 5000
    };

    const min = minAmounts[currency] || 1;
    const max = maxAmounts[currency] || 100000;

    if (amount < min) {
      throw new Error(`Minimum amount is ${min} ${currency}`);
    }
    if (amount > max) {
      throw new Error(`Maximum amount is ${max} ${currency}`);
    }

    return true;
  }

  // Get supported payment methods by country
  static getSupportedPaymentMethods(countryCode) {
    const supportedMethods = {
      'KE': ['mpesa', 'airtel_money', 'usdt', 'usdc'],
      'TZ': ['mpesa', 'airtel_money', 'usdt', 'usdc'],
      'UG': ['mpesa', 'airtel_money', 'usdt', 'usdc'],
      'NG': ['airtel_money', 'usdt', 'usdc'],
      'GH': ['airtel_money', 'usdt', 'usdc']
    };

    return supportedMethods[countryCode] || ['usdt', 'usdc'];
  }

  // Get bill providers by country and bill type
  static getBillProviders(countryCode, billType) {
    const providers = {
      'KE': {
        electricity: ['Kenya Power', 'KPLC'],
        water: ['Nairobi Water', 'Mombasa Water'],
        internet: ['Safaricom', 'Airtel', 'Telkom'],
        tv: ['DSTV', 'GOTV', 'StarTimes', 'Zuku']
      },
      'TZ': {
        electricity: ['Tanzania Electric Supply Company', 'TANESCO'],
        water: ['Dar es Salaam Water and Sewerage Authority'],
        internet: ['Vodacom', 'Airtel', 'Tigo'],
        tv: ['DSTV', 'GOTV', 'StarTimes']
      },
      'UG': {
        electricity: ['Uganda Electricity Distribution Company', 'UMEME'],
        water: ['National Water and Sewerage Corporation'],
        internet: ['MTN', 'Airtel', 'Uganda Telecom'],
        tv: ['DSTV', 'GOTV', 'StarTimes']
      }
    };

    return providers[countryCode]?.[billType] || [];
  }
}

export default PaymentAPIService;
