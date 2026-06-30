/* eslint-disable */
const request = require('supertest');
const app = require('../server'); // Import the raw express app instance cleanly

describe('SeaS Registration API Tests', () => {
    
    // 1. Test that missing required fields properly trigger a 400 Bad Request error
    it('should fail registration if required fields (like user_type or phone) are missing', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({
                full_name: "John Doe",
                email: "john@example.com",
                program: "B.Eng",
                specialty: "CSE"
                // Missing 'user_type' and 'phone' intentionally to force a validation failure
            });
        expect(res.statusCode).toBe(400);
    });

    // 2. Test that a complete payload successfully processes and returns 201 Created
    it('should validate a correct registration payload structure', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({
                full_name: "Modeste K",
                email: "modeste@example.com",
                user_type: "Student",
                program: "B.Eng",
                level: "Level 3",
                specialty: "CSE",
                phone: "+237670000000" // All required properties are now provided
            });
        
        // When all data fields are valid, it should successfully create the entry (201)
        expect(res.statusCode).toBe(201);
    });
});