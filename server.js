const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const app = express();
app.use(express.json());

// REAL POSTGRES DB
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});
const db = { query: (text, params) => pool.query(text, params) };

// HEALTH CHECK
app.get('/', (req, res) => res.json({ status: "Kiambu East API Running" }));
app.get('/health', (req, res) => res.json({ status: "ok", service: "kiambu-east-api" }));

// TEST DB CONNECTION
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ status: "DB Connected", time: result.rows[0].now });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// TEMP ROUTE TO CREATE TABLES - DELETE AFTER USING
app.get('/setup-db', async (req, res) => {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, phone VARCHAR(20) UNIQUE, coins INT DEFAULT 0, trial_used BOOLEAN DEFAULT false);`);
    await db.query(`CREATE TABLE IF NOT EXISTS transactions (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id), checkout_id VARCHAR(100), amount INT, coins INT, status VARCHAR(20) DEFAULT 'pending', mpesa_receipt VARCHAR(50), created_at TIMESTAMP DEFAULT NOW());`);
    res.json({ status: "Tables Created Successfully" });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// YOUR M-PESA CODE GOES HERE... keep your existing /api/mpesa routes

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const PORT = process.env.PORT || 10000;app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
