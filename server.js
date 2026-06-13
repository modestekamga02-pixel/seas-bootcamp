/* eslint-disable */
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// CETTE LIGNE EST CRUCIALE POUR TON DASHBOARD
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.post('/api/register', async (req, res) => {
    const { full_name, email, role } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO participants (full_name, email, role) VALUES ($1, $2, $3) RETURNING *',
            [full_name, email, role]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Redirection pour toutes les pages vers index.html si besoin
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
