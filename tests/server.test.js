const request = require('supertest');
const app = require('../server');

describe('API Route Integrations', () => {
    it('should reject incomplete registration profiles', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({ email: 'test@iuc-edu.cm' });
        
        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
    });

    it('should accept properly formatted profiles', async () => {
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
