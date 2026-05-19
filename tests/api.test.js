jest.mock('pg', () => {
  const mPool = {
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    on: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

const request = require('supertest');
const server = require('../server');

describe('CI/CD Pipeline Code Coverage Testing Suite', () => {
  afterAll((done) => {
    server.close(done);
  });

  test('GET /api/health returns 200 OK', async () => {
    const res = await request(server).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  test('POST /api/register handles validation errors cleanly', async () => {
    const res = await request(server).post('/api/register').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/registrations reads records gracefully', async () => {
    const res = await request(server).get('/api/registrations');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
