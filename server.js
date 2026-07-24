const express = require('express');
const axios = require('axios');
const { Pool } = require('pg'); // CHANGED FROM MYSQL
const app = express();
app.use(express.json());

// REAL POSTGRES DB CONNECTION
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

const db = {
  query: (text, params) => pool.query(text, params)
};

// HEALTH CHECK
app.get('/', (req, res) => {
  res.json({ status: "Kiambu East API Running" });
});
app.get('/health', (req, res) => {
  res.json({ status: "ok", service: "kiambu-east-api" });
});

// YOUR M-PESA CODE GOES HERE... keep your existing /api/mpesa routes

const PORT = process.env.PORT || 10000;
app.get('/setup-db', async (req, res) => {
  try {
    await db.query(`CREATE TABLE users (id SERIAL PRIMARY KEY, phone VARCHAR(20) UNIQUE, coins INT DEFAULT 0, trial_used BOOLEAN DEFAULT false);`);
    await db.query(`CREATE TABLE transactions (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id), checkout_id VARCHAR(100), amount INT, coins INT, status VARCHAR(20) DEFAULT 'pending', mpesa_receipt VARCHAR(50), created_at TIMESTAMP DEFAULT NOW());`);
    res.json({ status: "Tables Created" });
  } catch(e) {
    res.json({ error: e.message });
  }
});
app.listen(PORT, () => console.log('Server running on port', PORT));
app.get('/health', (req, res) => {
  res.json({ status: "ok", service: "kiambu-east-api" });
});
const PORT = process.env.PORT || 10000;app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
