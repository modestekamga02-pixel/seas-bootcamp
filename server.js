/* eslint-disable */
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// SEAS Bootcamp Program Definitions
const PROGRAM_CONFIG = {
    "Beng3": ["CSE", "CEE", "EME", "CHE"],
    "BTech2": ["CSE", "EEE", "MCT", "MEC"],
    "BSc2": ["MGT", "MIS", "AF", "DMK"],
    "BHSc": ["BMS3", "NUR3"]
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Updated Registration Route with Validation
app.post('/api/register', async (req, res) => {
    const { full_name, email, program, specialty } = req.body;

    // Validate if the program exists and if the specialty belongs to it
    if (!PROGRAM_CONFIG[program] || !PROGRAM_CONFIG[program].includes(specialty)) {
        return res.status(400).json({ success: false, message: "Invalid program or specialty combination." });
    }

    try {
        const result = await pool.query(
            'INSERT INTO participants (full_name, email, program, specialty) VALUES ($1, $2, $3, $4) RETURNING *',
            [full_name, email, program, specialty]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Admin access restricted via middleware
const adminAuth = (req, res, next) => {
    if (req.headers['x-admin-token'] === process.env.ADMIN_SECRET) {
        next();
    } else {
        res.status(403).json({ error: "Unauthorized access" });
    }
};

app.get('/api/admin/participants', adminAuth, async (req, res) => {
    const result = await pool.query('SELECT * FROM participants');
    res.json(result.rows);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
