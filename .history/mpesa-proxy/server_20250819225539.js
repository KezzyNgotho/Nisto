import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'Access-Control-Allow-Private-Network']
}));

// Explicitly allow Private Network Access preflight from browsers (Chrome)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Private-Network', 'true');
  next();
});

app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-access-token, Access-Control-Allow-Private-Network');
  res.sendStatus(204);
});

const PORT = process.env.PORT || 8787;
const DARAJA_BASE = process.env.DARAJA_BASE || 'https://sandbox.safaricom.co.ke';

// Expect these in environment or fallback to placeholders (do NOT commit real keys)
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// OAuth token
app.get('/oauth/token', async (_req, res) => {
  try {
    if (!CONSUMER_KEY || !CONSUMER_SECRET) {
      return res.status(500).json({ error: 'Missing MPESA_CONSUMER_KEY/MPESA_CONSUMER_SECRET' });
    }
    const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    const url = `${DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Basic ${credentials}` },
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'OAuth request failed', details: String(err) });
  }
});

// STK Push
app.post('/stkpush', async (req, res) => {
  try {
    const accessToken = req.headers['x-access-token'] || req.query.access_token || '';
    if (!accessToken) {
      return res.status(400).json({ error: 'Missing access token' });
    }
    const url = `${DARAJA_BASE}/mpesa/stkpush/v1/processrequest`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {}),
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
  // eslint-disable-next-line no-console
  console.log(`Mpesa proxy running on http://0.0.0.0:${PORT}`);
});


