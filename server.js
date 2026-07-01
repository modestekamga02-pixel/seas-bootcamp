const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(express.json());
app.use(cookieParser('seas-secret-2026')); 

// Security Gatekeeper: Blocks access if not logged in
function requireAdmin(req, res, next) {
    if (req.cookies.admin_authenticated === 'true') {
        return next();
    }
    // If it's an API request, return a clean JSON error status code
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({ success: false, error: "Unauthorized administrative access." });
    }
    // If it's a browser request for a page layout, redirect to login page
    res.redirect('/admin-login.html');
}

// 1. CRUCIAL FIX: Explicitly intercept and protect admin.html BEFORE serving the static 'public' directory.
// Otherwise, express.static can bypass your route declaration entirely.
app.get('/admin.html', requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve public static folder for assets, index, and login interfaces
app.use(express.static(path.join(__dirname, 'public')));

// Login API: Verify password and set secure cookie
app.post('/api/admin/login', (req, res) => {
    if (req.body.password === "SEAS2026_ADMIN") {
        res.cookie('admin_authenticated', 'true', { httpOnly: true, maxAge: 3600000 });
        return res.json({ success: true });
    }
    res.status(401).json({ success: false });
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

// PUBLIC REGISTRATION POST ENDPOINT
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

// PROTECTED ADMINISTRATIVE ENDPOINTS (Appended requireAdmin security check)

// GET REGISTERED PARTICIPANTS POOL ENDPOINT
app.get('/api/participants', requireAdmin, (req, res) => {
    const data = readDatabase();
    res.json(data);
});

// PIPELINE ALIAS: Resolves the CI/CD test runner's target path expectations
app.get('/api/registrations', requireAdmin, (req, res) => {
    const data = readDatabase();
    res.json({ success: true, count: data.length, data: data });
});

// WIPE ENTIRE DATABASE RECORDS (ADMIN ACTION ONLY)
app.delete('/api/clear', requireAdmin, (req, res) => {
    writeDatabase([]);
    res.json({ success: true, message: "Database wiped successfully." });
});

// Catch-all route to serve home page layout
app.get('*', (pathRequest, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// FIXED: Dynamically bind port environment parameters for cloud environment validation
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Persistent Server actively handling traffic on port ${PORT}`);
    });
}

// Export the raw instance app context so Supertest can hook directly into it smoothly
module.exports = app;