require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());
const db = mysql.createPool({host: process.env.DB_HOST,user: process.env.DB_USER,password: process.env.DB_PASS,database: process.env.DB_NAME});
const MPESA = {consumerKey: process.env.MPESA_CONSUMER_KEY,consumerSecret: process.env.MPESA_CONSUMER_SECRET,shortCode: process.env.MPESA_SHORTCODE,passkey: process.env.MPESA_PASSKEY,callbackUrl: process.env.CALLBACK_URL,baseUrl: 'https://sandbox.safaricom.co.ke'}
app.get('/', (req, res) => {res.json({ status: "Kiambu East API Running" });});
async function getToken() {const auth = Buffer.from(`${MPESA.consumerKey}:${MPESA.consumerSecret}`).toString('base64');const res = await axios.get(`${MPESA.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {headers: { Authorization: `Basic ${auth}` }});return res.data.access_token;}
app.post('/api/pay', async (req, res) => {try {const { phone, bundle, user_id } = req.body;const bundles = { trial: { amount: 70, coins: 1 }, '300': { amount: 300, coins: 5 }, '700': { amount: 700, coins: 12 } };const selected = bundles[bundle];if (!selected) return res.status(400).json({ error: "Invalid bundle" });const token = await getToken();const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);const password = Buffer.from(`${MPESA.shortCode}${MPESA.passkey}${timestamp}`).toString('base64');const formattedPhone = phone.startsWith('0')? '254' + phone.slice(1) : phone;const payload = {BusinessShortCode: MPESA.shortCode, Password: password, Timestamp: timestamp,TransactionType: "CustomerPayBillOnline", Amount: selected.amount,PartyA: formattedPhone, PartyB: MPESA.shortCode, PhoneNumber: formattedPhone,CallBackURL: MPESA.callbackUrl, AccountReference: `KE_${user_id}_${bundle}`,TransactionDesc: `${selected.coins} Coins Purchase`};const stkRes = await axios.post(`${MPESA.baseUrl}/mpesa/stkpush/v1/processrequest`, payload, {headers: { Authorization: `Bearer ${token}` }});await db.query('INSERT INTO transactions (user_id, amount, coins, checkout_id, status) VALUES (?,?,?,?,?)',[user_id, selected.amount, selected.coins, stkRes.data.CheckoutRequestID, 'pending']);res.json({ success: true, message: "STK Push Sent", data: stkRes.data });} catch (error) {res.status(500).json({ error: "Payment initiation failed" });}});
app.post('/api/mpesa/callback', async (req, res) => {
  const callback = req.body.Body.stkCallback;
  if (callback.ResultCode === 0) {
    const checkoutId = callback.CheckoutRequestID;
    const receipt = callback.CallbackMetadata.Item.find(i => i.Name === 'MpesaReceiptNumber').Value;
    const tx = await db.query('SELECT * FROM transactions WHERE checkout_id =?', [checkoutId]);
    await db.query('UPDATE users SET coins = coins +? WHERE id =?', [tx[0].coins, tx[0].user_id]);
    if (tx[0].amount === 70) await db.query('UPDATE users SET trial_used = 1 WHERE id =?', [tx[0].user_id]);
    await db.query('UPDATE transactions SET status = "success", mpesa_receipt =? WHERE checkout_id =?', [receipt, checkoutId]);
  }
  res.json({ ResultCode: 0, ResultDesc: "Success" });
});
// Health check route
app.get('/health', (req, res) => {
  res.json({ status: "ok", service: "kiambu-east-api" });
});
const PORT = process.env.PORT || 10000;app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
