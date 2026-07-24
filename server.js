const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const app = express();
app.use(express.json());

// CONNECT TO REAL POSTGRES ON RENDER
postgresql://east_user:RWuJEo0rezl1SBoHZsbaqOBiyUviMr8X@dpg-d9hpslepbkes738vb3qg-a/east_dp
const db = { query: (text, params) => pool.query(text, params) };

// BASIC ROUTES
app.get('/', (req, res) => res.json({ status: "Kiambu East API Running" }));
app.get('/health', (req, res) => res.json({ status: "ok", service: "kiambu-east-api" }));

// TEST IF DB IS CONNECTED
app.get('/test-db', async (req, res) => {
  try {
    console.log("Trying to connect with:", {
      host: process.env.DB_HOST,
      db: process.env.DB_NAME,
      user: process.env.DB_USER,
      port: process.env.DB_PORT
    });
    const result = await pool.query('SELECT NOW()');
    res.json({ status: "DB Connected", time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.json({ status: "DB Error", error: err.message, code: err.code });
  }
});

// CREATE TABLES - USE ONCE THEN DELETE THIS ROUTE
app.get('/setup-db', async (req, res) => {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, phone VARCHAR(20) UNIQUE, coins INT DEFAULT 0, trial_used BOOLEAN DEFAULT false);`);
    await db.query(`CREATE TABLE IF NOT EXISTS transactions (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id), checkout_id VARCHAR(100), amount INT, coins INT, status VARCHAR(20) DEFAULT 'pending', mpesa_receipt VARCHAR(50), created_at TIMESTAMP DEFAULT NOW());`);
    res.json({ status: "Tables Created Successfully" });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT YOUR M-PESA STK PUSH CODE HERE

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
