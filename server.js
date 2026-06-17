const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to process incoming requests data arrays
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets directly from the public directory folder
app.use(express.static(path.join(__dirname, 'public')));

// Mock in-memory runtime database array storage context
let databaseRegistrations = [
    {
        id: "node-1",
        full_name: "Modeste-K",
        email: "modestekamga02@gmail.com",
        program: "B.Tech",
        level: "Level 2",
        specialty: "CSE",
        phone: "+237 600 000 000"
    }
];

// =========================================================================
// BACKEND CORE API ROUTES (MUST BE REGISTERED BEFORE STATIC CATCH-ALLS)
// =========================================================================

// 1. GET: Fetch all registrations inside database cluster
app.get('/api/registrations', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(databaseRegistrations);
});

// 2. POST: Commit new entry data profiles routing logic
app.post('/api/register', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const { full_name, email, user_type, program, level, specialty, phone } = req.body;

    if (!full_name || !email) {
        return res.status(400).json({ success: false, error: "Validation Fault: Full Name and Email are mandatory parameters." });
    }

    const newNode = {
        id: 'node-' + Date.now(),
        full_name,
        email,
        user_type,
        program,
        level,
        specialty,
        phone: phone || "N/A"
    };

    databaseRegistrations.push(newNode);
    return res.status(201).json({ success: true, entry: newNode });
});

// 3. DELETE: Drop verified entry nodes from context index
app.delete('/api/registrations/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const targetId = req.params.id;
    const initialLength = databaseRegistrations.length;
    
    databaseRegistrations = databaseRegistrations.filter(item => item.id !== targetId);

    if (databaseRegistrations.length < initialLength) {
        return res.status(200).json({ success: true });
    } else {
        return res.status(404).json({ success: false, error: "Target node entity index not found inside matrix tracking." });
    }
});

// =========================================================================
// EXPLICIT STATIC ROUTING CONTEXT FALLBACKS
// =========================================================================

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/register.html'));
});

app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin-login.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin.html'));
});

// Main system entry page hook fallback rule
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start local infrastructure engine listener
app.listen(PORT, () => {
    console.log(`======================================================`);
    console.log(`  SEAS Bootcamp Control Engine Running on Port ${PORT}`);
    console.log(`  Local Access Hub: http://localhost:${PORT}          `);
    console.log(`======================================================`);
});