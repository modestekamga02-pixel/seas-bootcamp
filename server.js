const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const app = express();

const DATA_FILE = path.join(__dirname, 'data.json');
const GROUPS_FILE = path.join(__dirname, 'groups.json');
const PHASES_FILE = path.join(__dirname, 'phases.json');

// Middleware
app.use(express.json());
app.use(cookieParser('seas-secret-2026'));

// Security Gatekeeper: Blocks access if not logged in
function requireAdmin(req, res, next) {
    if (req.cookies.admin_authenticated === 'true') {
        return next();
    }
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({ success: false, error: "Unauthorized administrative access." });
    }
    res.redirect('/admin-login.html');
}

// Explicitly intercept and protect admin.html BEFORE serving the static 'public' directory.
app.get('/admin.html', requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Protect secondary custom admin sub-screens before falling back to static engines
app.get('/admin/groups-builder.html', requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'groups-builder.html'));
});

app.get('/admin/phases-editor.html', requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'phases-editor.html'));
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
function readDatabase(file = DATA_FILE, defaultStructure = []) {
    try {
        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, JSON.stringify(defaultStructure));
            return defaultStructure;
        }
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data || JSON.stringify(defaultStructure));
    } catch (error) {
        console.error(`Database reading error (${file}):`, error);
        return defaultStructure;
    }
}

// FIXED: Clean database verification matrix handler
function writeDatabase(data, file = DATA_FILE) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Database writing error (${file}):`, error);
    }
}

// PUBLIC/ADMIN REGISTRATION ENDPOINTS
app.get('/api/participants', (req, res) => {
    const data = readDatabase(DATA_FILE);
    res.json(data);
});

app.post('/api/register', (req, res) => {
    const { full_name, email, user_type, program, level, specialty, phone } = req.body;
    if (!full_name || !email || !user_type || !phone) {
        return res.status(400).json({ success: false, error: "Required fields missing." });
    }
    const currentRecords = readDatabase(DATA_FILE);
    const newEntry = {
        id: Date.now().toString(), // Unique ID key for target identification during inline grid mutations
        full_name,
        email,
        user_type,
        program: program || "N/A",
        level: level || "N/A",
        specialty: specialty || "N/A",
        phone
    };
    currentRecords.push(newEntry);
    writeDatabase(currentRecords, DATA_FILE);
    res.status(201).json({ success: true, data: newEntry });
});

// UPDATE ENTIRE PARTICIPANT MATRIX (For Manual Admin Row Inlines/Edits/Deletions)
app.put('/api/participants', requireAdmin, (req, res) => {
    if (!Array.isArray(req.body)) {
        return res.status(400).json({ success: false, error: "Invalid layout matrix data structure provided." });
    }
    writeDatabase(req.body, DATA_FILE);
    res.json({ success: true, message: "Participants updated successfully." });
});

// --- DYNAMIC INTERACTIVE GROUP CREATOR & PROJECT ASSIGNER API ---
app.get('/api/groups', (req, res) => {
    const defaultData = { headers: ["Group Name", "Assigned Project Title", "Assigned Members/Students"], rows: [] };
    res.json(readDatabase(GROUPS_FILE, defaultData));
});

app.post('/api/groups/publish', requireAdmin, (req, res) => {
    writeDatabase(req.body, GROUPS_FILE);
    res.json({ success: true, message: "Group lists and project matrices published successfully." });
});

// --- BOOTCAMP TIMELINE MILESTONE PHASES CONFIGURATOR API ---
app.get('/api/phases', (req, res) => {
    const defaultData = { headers: ["Phase", "Activities Details Description", "Timeline Duration Window"], rows: [] };
    res.json(readDatabase(PHASES_FILE, defaultData));
});

app.post('/api/phases/publish', requireAdmin, (req, res) => {
    writeDatabase(req.body, PHASES_FILE);
    res.json({ success: true, message: "Bootcamp milestone phases matrix published successfully." });
});

// PIPELINE ALIAS: Resolves the CI/CD test runner's target path expectations
app.get('/api/registrations', requireAdmin, (req, res) => {
    const data = readDatabase(DATA_FILE);
    res.json({ success: true, count: data.length, data: data });
});

// WIPE ENTIRE DATABASE RECORDS (ADMIN ACTION ONLY)
app.delete('/api/clear', requireAdmin, (req, res) => {
    writeDatabase([], DATA_FILE);
    res.json({ success: true, message: "Database wiped successfully." });
});

// FIXED: Explicit route handlers to bypass catch-all fallbacks on cloud systems
app.get('/phases.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'phases.html'));
});

app.get('/phases', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'phases.html'));
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

module.exports = app;