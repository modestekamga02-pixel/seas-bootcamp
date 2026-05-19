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

describe('SEAS Bootcamp CI Pipeline Validation Suite', () => {
  afterAll((done) => {
    server.close(done);
  });

  test('GET /api/health should return 200 OK', async () => {
    const res = await request(server).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  test('POST /api/register invalid fields verification', async () => {
    const res = await request(server).post('/api/register').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/registrations verification data layout', async () => {
    const res = await request(server).get('/api/registrations');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
