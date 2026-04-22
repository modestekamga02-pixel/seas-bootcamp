// ============================================================
// SEAS Bootcamp — Unit Tests
// File: tests/api.test.js
//
// WHAT THESE TESTS DO:
// They test every API route in server.js automatically.
// Jest sends fake HTTP requests to your server and checks
// that the responses are correct.
//
// WHY TESTS ARE REQUIRED BY THE CDC:
// "Tests Jest/ESLint" are explicitly listed in the CI/CD pipeline
// and in the Flux 4 sequence diagram of the CDC.
// ============================================================

const request = require('supertest');
const app     = require('../server');

// ============================================================
// TEST SUITE 1: Health Check
// ============================================================
describe('GET /api/health', () => {

  test('should return status OK with version', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.version).toBeDefined();
  });

});

// ============================================================
// TEST SUITE 2: Registration — POST /api/register
// ============================================================
describe('POST /api/register', () => {

  // Test 1: Valid registration
  test('should register a participant successfully', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        full_name:      'KAMGA Modeste Test',
        email:          `test.${Date.now()}@iuc.cm`,   // Unique email each run
        role:           'Student',
        academic_level: 'Level 2',
        speciality:     'BTech-CSE'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('KAMGA Modeste Test');
  });

  // Test 2: Missing required fields
  test('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        full_name: 'Missing Fields Test'
        // email and role are missing
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 3: Duplicate email
  test('should return 409 if email is already registered', async () => {
    const duplicateEmail = `duplicate.${Date.now()}@iuc.cm`;

    // First registration
    await request(app)
      .post('/api/register')
      .send({
        full_name: 'First User',
        email:     duplicateEmail,
        role:      'Student'
      });

    // Second registration with same email
    const res = await request(app)
      .post('/api/register')
      .send({
        full_name: 'Second User',
        email:     duplicateEmail,
        role:      'Teacher'
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  // Test 4: Empty body
  test('should return 400 for completely empty body', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

});

// ============================================================
// TEST SUITE 3: Admin — GET /api/registrations
// ============================================================
describe('GET /api/registrations', () => {

  test('should return list of registrations', async () => {
    const res = await request(app).get('/api/registrations');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(typeof res.body.count).toBe('number');
  });

  test('count should match data array length', async () => {
    const res = await request(app).get('/api/registrations');

    expect(res.body.count).toBe(res.body.data.length);
  });

});

// ============================================================
// TEST SUITE 4: Single record — GET /api/registrations/:id
// ============================================================
describe('GET /api/registrations/:id', () => {

  test('should return 404 for non-existent ID', async () => {
    const res = await request(app).get('/api/registrations/999999');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

});

// ============================================================
// TEST SUITE 5: Delete — DELETE /api/registrations/:id
// ============================================================
describe('DELETE /api/registrations/:id', () => {

  test('should delete an existing registration', async () => {
    // First create a registration to delete
    const create = await request(app)
      .post('/api/register')
      .send({
        full_name: 'Delete Me Test',
        email:     `delete.${Date.now()}@iuc.cm`,
        role:      'Student'
      });

    const id = create.body.data.id;

    // Now delete it
    const res = await request(app).delete(`/api/registrations/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

});
