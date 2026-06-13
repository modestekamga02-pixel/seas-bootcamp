const request = require('supertest');
const app = require('../server'); // Pulls in your Express server module

describe('SEAS & IUC Registration Pipeline Verification', () => {

    // Test Check 1: Validation Check
    it('should block registrations missing vital identity keys', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({
                email: 'test-student@iuc-edu.cm'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
    });

    // Test Check 2: Success Track Check
    it('should successfully accept valid IUC Student Presenter profiles', async () => {
        const res = await request(app)
            .post('/api/register')
            .set('x-ci-test', 'true') // Triggers the safe CI workflow header
            .send({
                full_name: 'Modeste K',
                email: 'modeste@iuc-edu.cm',
                role: 'Student (Presenter)',
                level: 'Level 3 (BEng / BHSc)',
                specialty: 'CSE (Cloud Computing / DevOps)'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.full_name).toEqual('Modeste K');
    });
});
