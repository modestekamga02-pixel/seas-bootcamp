const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Active structural seed database mockup configuration array tracking
let databaseRegistrations = [
    { id: "seed-1", full_name: "Modeste-K", email: "modeste@iuc.cm", user_type: "Student", program: "B.Tech", level: "Level 4", specialty: "CSE (Cloud/Software)", phone: "N/A" },
    { id: "seed-2", full_name: "Dr. Kamga", email: "kamga.instructor@iuc.cm", user_type: "Teacher / Instructor", program: "N/A", level: "N/A", specialty: "N/A", phone: "N/A" }
];

// 1. GET API — Pull entire registration array matrix entries context
app.get('/api/registrations', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(databaseRegistrations);
});

// 2. POST API — Push newly verified entry data fields straight into pool
app.post('/api/register', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const { full_name, email, user_type, program, level, specialty, phone } = req.body;

    if (!full_name || !email || !user_type) {
        return res.status(400).json({ success: false, error: "Validation Intercept Error: Core parameters missing." });
    }

    const newRecord = {
        id: 'node-' + Date.now(),
        full_name,
        email,
        user_type,
        program,
        level,
        specialty,
        phone
    };

    databaseRegistrations.push(newRecord);
    return res.status(201).json({ success: true, record: newRecord });
});

// 3. DELETE API — Clean up database profiles indexes entries
app.delete('/api/registrations/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    databaseRegistrations = databaseRegistrations.filter(item => item.id !== req.params.id);
    return res.status(200).json({ success: true });
});

// Static SPA Fallback paths routing
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public/register.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public/admin.html')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));

app.listen(PORT, () => {
    console.log(`======================================================`);
    console.log(` SEAS Bootcamp Hub Engine Active on Port ${PORT}       `);
    console.log(` Test Registration Endpoint: http://localhost:${PORT}/register `);
    console.log(`======================================================`);
});