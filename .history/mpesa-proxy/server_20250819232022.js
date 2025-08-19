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

if (!CONSUMER_KEY || !CONSUMER_SECRET || !PASSKEY) {
  throw new Error('Missing Daraja credentials in env');
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

// STK Push endpoint
app.post('/stkpush', async (req, res) => {
  try {
    const { phone, amount } = req.body;
    if (!phone || !amount) {
      return res.status(400).json({ error: 'Missing phone or amount' });
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Mpesa proxy running on http://0.0.0.0:${PORT}`);
});
