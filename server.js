import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test DB
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: "DB Connected", time: result.rows[0].now });
  } catch (err) {
    res.json({ status: "DB Error", error: err.message });
  }
});

// Create tables
app.get('/setup-db', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS farmers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        location VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    res.json({ status: "Tables created successfully" });
  } catch (err) {
    res.json({ status: "Setup Error", error: err.message });
  }
});

// ADD farmer
app.post('/farmers', async (req, res) => {
  const { name, phone, location } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO farmers(name, phone, location) VALUES($1, $2, $3) RETURNING *',
      [name, phone, location]
    );
    res.json({ status: "Farmer added", farmer: result.rows[0] });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// GET all farmers
app.get('/farmers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM farmers ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: "Kiambu East API is running" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
