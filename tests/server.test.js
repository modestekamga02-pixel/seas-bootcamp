const request = require('supertest');
const app = require('../server');

describe('Registration Pipeline API Verification', () => {
    it('should block registrations missing vital identity keys', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({ email: 'test-student@iuc-edu.cm' });
        
        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
    });

    it('should successfully accept valid profiles', async () => {
        const res = await request(app)
            .post('/api/register')
            .set('x-ci-test', 'true')
            .send({
                full_name: 'Modeste K',
                email: 'modeste@iuc-edu.cm',
                role: 'Student (Presenter)'
            });
        
        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
    });
});
