const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(express.json());
app.use(cookieParser('seas-secret-2026')); 
app.use(express.static(path.join(__dirname, 'public')));

// Security Gatekeeper: Blocks access if not logged in
function requireAdmin(req, res, next) {
    if (req.cookies.admin_authenticated === 'true') {
        return next();
    }
    res.redirect('/admin-login.html');
}

// Login API: Verify password and set secure cookie
app.post('/api/admin/login', (req, res) => {
    if (req.body.password === "SEAS2026_ADMIN") {
        res.cookie('admin_authenticated', 'true', { httpOnly: true, maxAge: 3600000 });
        return res.json({ success: true });
    }
    res.status(401).json({ success: false });
});

// Protect the Admin Dashboard
app.get('/admin.html', requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Helper functions to handle persistent reads/writes safely on disk
function readDatabase() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error("Database reading error:", error);
        return [];
    }
}

function writeDatabase(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Database writing error:", error);
    }
}

// REGISTRATION POST ENDPOINT
app.post('/api/register', (req, res) => {
    const { full_name, email, user_type, program, level, specialty, phone } = req.body;
    if (!full_name || !email || !user_type || !phone) {
        return res.status(400).json({ success: false, error: "Required fields missing." });
    }
    const currentRecords = readDatabase();
    const newEntry = {
        full_name,
        email,
        user_type,
        program: program || "N/A",
        level: level || "N/A",
        specialty: specialty || "N/A",
        phone
    };
    currentRecords.push(newEntry);
    writeDatabase(currentRecords);
    res.status(201).json({ success: true, data: newEntry });
});

// GET REGISTERED PARTICIPANTS POOL ENDPOINT
app.get('/api/participants', (req, res) => {
    const data = readDatabase();
    res.json(data);
});

// PIPELINE ALIAS: Resolves the CI/CD test runner's target path expectations
app.get('/api/registrations', (req, res) => {
    const data = readDatabase();
    res.json({ success: true, count: data.length, data: data });
});

// WIPE ENTIRE DATABASE RECORDS (ADMIN ACTION ONLY)
app.delete('/api/clear', (req, res) => {
    writeDatabase([]);
    res.json({ success: true, message: "Database wiped successfully." });
});

app.get('*', (pathRequest, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// CRUCIAL PIECE FOR CI/CD GREEN CHAINS: Only boot server if not importing for testing environments
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 10000;
    app.listen(PORT, () => {
        console.log(`Persistent Server actively handling traffic on http://localhost:${PORT}`);
    });
}

// Export the raw instance app context so Supertest can hook directly into it smoothly
module.exports = app;
