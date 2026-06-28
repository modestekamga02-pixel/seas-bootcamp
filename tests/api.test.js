jest.mock('pg', () => {
  const mPool = {
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    on: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

const request = require('supertest');
const app = require('../server'); // Import the raw express app instance cleanly

describe('CI/CD Pipeline Code Coverage Testing Suite', () => {
  // Supertest manages the app routing lifecycle automatically, 
  // so explicit server listener cleanup blocks are no longer required.

  test('GET / returns the index landing page layout context', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });

  test('POST /api/register handles validation errors cleanly', async () => {
    const res = await request(app).post('/api/register').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/registrations reads records gracefully', async () => {
    const res = await request(app).get('/api/registrations');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
