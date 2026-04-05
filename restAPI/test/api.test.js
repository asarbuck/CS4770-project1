const request = require('supertest');

// Mock pg before requiring index.js
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  };
  return { Pool: jest.fn(() => mPool) };
});

const { app } = require('../index');
const { Pool } = require('pg');
const db = new Pool();

afterEach(() => {
  db.query.mockClear();
  db.query.mockResolvedValue({ rows: [], rowCount: 0 }); // reset to safe default
});

// ── POST /temperature ─────────────────────────────────────────────────────────

describe('POST /temperature', () => {

  test('stores a valid reading and returns 201 with status and id', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const res = await request(app)
      .post('/temperature')
      .send({ temperature: 24.5, timestamp: '2026-03-10T14:20:00Z' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ status: 'stored', id: 1 });
  });

  test('returns 400 when temperature is missing', async () => {
    const res = await request(app)
      .post('/temperature')
      .send({ timestamp: '2026-03-10T14:20:00Z' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/temperature and timestamp are required/);
  });

  test('returns 400 when timestamp is missing', async () => {
    const res = await request(app)
      .post('/temperature')
      .send({ temperature: 24.5 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/temperature and timestamp are required/);
  });

  test('returns 400 when body is empty', async () => {
    const res = await request(app)
      .post('/temperature')
      .send({});

    expect(res.status).toBe(400);
  });

  test('passes temperature and timestamp to the database', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 2 }] });

    await request(app)
      .post('/temperature')
      .send({ temperature: 36.6, timestamp: '2026-03-10T14:20:00Z' });

    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toMatch(/INSERT INTO temperature_readings/);
    expect(params).toContain(36.6);
    expect(params).toContain('2026-03-10T14:20:00Z');
  });

  test('returns 500 when the database throws', async () => {
    db.query.mockRejectedValueOnce(new Error('DB connection lost'));

    const res = await request(app)
      .post('/temperature')
      .send({ temperature: 24.5, timestamp: '2026-03-10T14:20:00Z' });

    expect(res.status).toBe(500);
  });

});

// ── GET /temperature/:id ──────────────────────────────────────────────────────

describe('GET /temperature/:id', () => {

  test('returns the reading for a valid id', async () => {
    const reading = { id: 1, temperature: '24.50', timestamp: '2026-03-10T14:20:00.000Z' };
    db.query.mockResolvedValueOnce({ rowCount: 1, rows: [reading] });

    const res = await request(app).get('/temperature/1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(reading);
  });

  test('returns 404 when id does not exist', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const res = await request(app).get('/temperature/999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  test('queries the database with the correct id', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 5 }] });

    await request(app).get('/temperature/5');

    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toMatch(/WHERE id = \$1/);
    expect(params).toContain('5');
  });

  test('returns 500 when the database throws', async () => {
    db.query.mockRejectedValueOnce(new Error('DB timeout'));

    const res = await request(app).get('/temperature/1');

    expect(res.status).toBe(500);
  });

});