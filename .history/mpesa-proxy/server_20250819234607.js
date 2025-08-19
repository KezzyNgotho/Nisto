import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || true,
  credentials: true
}));

const PORT = process.env.PORT || 8787;
const DARAJA_BASE = process.env.DARAJA_BASE || 'https://sandbox.safaricom.co.ke';

// From .env
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const SHORTCODE = process.env.MPESA_SHORTCODE || '174379'; // Sandbox shortcode
const PASSKEY = process.env.MPESA_PASSKEY;                 // Get from Daraja portal
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/callback';
// B2C related
const INITIATOR_NAME = process.env.MPESA_INITIATOR_NAME || '';
const SECURITY_CREDENTIAL = process.env.MPESA_SECURITY_CREDENTIAL || '';
const B2C_RESULT_URL = process.env.MPESA_B2C_RESULT_URL || 'https://example.com/b2c/result';
const B2C_TIMEOUT_URL = process.env.MPESA_B2C_TIMEOUT_URL || 'https://example.com/b2c/timeout';

// Don't crash on startup; validate per-endpoint
if (!CONSUMER_KEY || !CONSUMER_SECRET) {
  console.warn('⚠️ MPESA_CONSUMER_KEY/MPESA_CONSUMER_SECRET not set. /oauth/token will fail until provided.');
}

// helper: get OAuth token
async function getAccessToken() {
  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const url = `${DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials`;
  const response = await fetch(url, {
    headers: { Authorization: `Basic ${credentials}` }
  });
  if (!response.ok) throw new Error(`OAuth failed: ${response.statusText}`);
  const data = await response.json();
  return data.access_token;
}

// helper: generate timestamp
function getTimestamp() {
  const now = new Date();
  const YYYY = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const DD = String(now.getDate()).padStart(2, '0');
  const HH = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${YYYY}${MM}${DD}${HH}${mm}${ss}`;
}

// helper: build password
function buildPassword(shortcode, passkey, timestamp) {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
}

app.get('/health', (_req, res) => res.json({ ok: true }));

// Expose OAuth token endpoint
app.get('/oauth/token', async (_req, res) => {
  try {
    if (!CONSUMER_KEY || !CONSUMER_SECRET) {
      return res.status(500).json({ error: 'Missing MPESA_CONSUMER_KEY/MPESA_CONSUMER_SECRET' });
    }
    const token = await getAccessToken();
    res.json({ access_token: token, expires_in: 3599 });
  } catch (err) {
    res.status(500).json({ error: 'OAuth request failed', details: String(err) });
  }
});

// STK Push endpoint
app.post('/stkpush', async (req, res) => {
  try {
    const { phone, amount } = req.body;
    if (!phone || !amount) {
      return res.status(400).json({ error: 'Missing phone or amount' });
    }

    if (!PASSKEY) {
      return res.status(500).json({ error: 'Missing MPESA_PASSKEY on server' });
    }

    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const password = buildPassword(SHORTCODE, PASSKEY, timestamp);

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: CALLBACK_URL,
      AccountReference: "NestoApp",
      TransactionDesc: "Deposit"
    };

    const url = `${DARAJA_BASE}/mpesa/stkpush/v1/processrequest`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'STK Push failed', details: String(err) });
  }
});

// B2C v3 payment request (payouts to phone)
app.post('/b2c/payment', async (req, res) => {
  try {
    const { phone, amount, remarks, occasion, commandId } = req.body || {};
    if (!phone || !amount) {
      return res.status(400).json({ error: 'Missing phone or amount' });
    }

    if (!INITIATOR_NAME || !SECURITY_CREDENTIAL) {
      return res.status(500).json({ error: 'Missing MPESA_INITIATOR_NAME or MPESA_SECURITY_CREDENTIAL on server' });
    }

    const accessToken = await getAccessToken();

    const payload = {
      InitiatorName: INITIATOR_NAME,
      SecurityCredential: SECURITY_CREDENTIAL,
      CommandID: commandId || 'BusinessPayment',
      Amount: Number(amount),
      PartyA: SHORTCODE,
      PartyB: phone,
      Remarks: remarks || 'Payout',
      QueueTimeOutURL: B2C_TIMEOUT_URL,
      ResultURL: B2C_RESULT_URL,
      Occasion: occasion || ''
    };

    const url = `${DARAJA_BASE}/mpesa/b2c/v3/paymentrequest`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'B2C payment failed', details: String(err) });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Mpesa proxy running on http://0.0.0.0:${PORT}`);
});
