import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Connect to Postgres using DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Render
});

// Test DB connection
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: "DB Connected", time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.json({ status: "DB Error", error: err.message });
  }
});

// Setup DB Tables
app.get('/setup-db', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS farmers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        phone VARCHAR(20) UNIQUE,
        location VARCHAR(100)
      );
    `);
    res.json({ status: "Tables created successfully" });
  } catch (err) {
    res.json({ status: "Setup Error", error: err.message });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: "Kiambu East API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
