/* eslint-disable */
const request = require('supertest');
const app = require('../server');

describe('API Tests', () => {
    it('test de connexion', async () => {
        const res = await request(app).post('/api/register').send({});
        expect(res.statusCode).toBe(500);
    });
});
