const express = require('express');
const axios = require('axios');
const moment = require('moment');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

let rentals = [];
let tokens = {};
let usedTest = {};

const PACKAGES = { 70: 1, 300: 3, 700: 10, 1000: 15, 2000: 20 };

app.get('/rentals', (req, res) => res.json(rentals));
app.post('/rentals', (req, res) => {
  const { title, price, location, contact, bedrooms, bathrooms } = req.body;
  const newRental = {id: Date.now().toString(), title, price, location, contact, bedrooms: bedrooms || "1", bathrooms: bathrooms || "1", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"};
  rentals.push(newRental);
  res.status(201).json(newRental);
});
app.get('/rentals/:id', (req, res) => {const r = rentals.find(r => r.id === req.params.id); r? res.json(r) : res.status(404).json({error: "Not found"})});

// ===== M-PESA - PUT YOUR KEYS HERE =====
const CONSUMER_KEY = 'YOUR_KEY';
const CONSUMER_SECRET = 'YOUR_SECRET';
const BUSINESS_SHORT_CODE = '174379';
const PASSKEY = 'YOUR_PASSKEY';
const CALLBACK_URL = 'https://kiambu-east-api.onrender.com/mpesa/callback'; // CHANGE TO YOUR URL

async function getMpesaToken() {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const res = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {headers: { Authorization: `Basic ${auth}` }});
  return res.data.access_token;
}

app.post('/mpesa/stkpush', async (req, res) => {
  try {
    const { phone, amount } = req.body;
    if(!PACKAGES[amount]) return res.status(400).json({error: "Invalid amount"});
    if(amount == 70 && usedTest[phone]) return res.status(400).json({error: "Test used"});
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(BUSINESS_SHORT_CODE + PASSKEY + timestamp).toString('base64');
    const token = await getMpesaToken();
    const stkData = {BusinessShortCode: BUSINESS_SHORT_CODE, Password: password, Timestamp: timestamp, TransactionType: "CustomerPayBillOnline", Amount: amount, PartyA: phone, PartyB: BUSINESS_SHORT_CODE, PhoneNumber: phone, CallBackURL: CALLBACK_URL, AccountReference: "KiambuRental", TransactionDesc: `Buy ${PACKAGES[amount]} Tokens`};
    const stkRes = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', stkData, {headers: { Authorization: `Bearer ${token}` }});
    res.json(stkRes.data);
  } catch(e){ res.status(500).json({error: e.message}) }
});

app.post('/mpesa/callback', (req, res) => {
  const callback = req.body.Body.stkCallback;
  if(callback.ResultCode === 0) {
    const items = callback.CallbackMetadata.Item;
    const phone = items.find(i => i.Name === 'PhoneNumber').Value.toString();
    const amount = items.find(i => i.Name === 'Amount').Value;
    tokens[phone] = (tokens[phone] || 0) + PACKAGES[amount];
    if(amount == 70) usedTest[phone] = true;
  }
  res.json({ResultCode: 0});
});

app.get('/checktokens', (req, res) => res.json({tokens: tokens[req.query.phone] || 0}));
app.post('/deducttoken', (req, res) => {const { phone } = req.body; if((tokens[phone] || 0) > 0){tokens[phone]--; res.json({success: true, remaining: tokens[phone]})} else res.json({success: false})});

app.listen(process.env.PORT || 3000);
