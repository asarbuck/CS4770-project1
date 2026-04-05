const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'temperatures',
  user:     process.env.DB_USER     || 'api_user',
  password: process.env.DB_PASSWORD || 'secret',
});

// Create table on startup
pool.query(`
  CREATE TABLE IF NOT EXISTS temperature_readings (
    id          SERIAL PRIMARY KEY,
    temperature NUMERIC(6, 2) NOT NULL,
    timestamp   TIMESTAMPTZ   NOT NULL
  )
`).then(() => console.log('DB ready'));

// POST /temperature  — store a reading
app.post('/temperature', async (req, res) => {
  const { temperature, timestamp } = req.body;

  if (temperature === undefined || !timestamp) {
    return res.status(400).json({ error: 'temperature and timestamp are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO temperature_readings (temperature, timestamp) VALUES ($1, $2) RETURNING id',
      [temperature, timestamp]
    );
    res.status(201).json({ status: 'stored', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /temperature/:id  — retrieve a reading by ID
app.get('/temperature/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM temperature_readings WHERE id = $1',
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
}

module.exports = { app, pool };