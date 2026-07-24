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
app.listen(PORT, () => console.log('Server running on port', PORT));
app.get('/health', (req, res) => {
  res.json({ status: "ok", service: "kiambu-east-api" });
});
const PORT = process.env.PORT || 10000;app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
