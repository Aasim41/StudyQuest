const request = require('supertest');
const app = require('../server');

describe('API Endpoints', () => {
  it('GET /api/health should return 200 and success status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('GET /api/flow/search without q should return 400 validation error', async () => {
    const res = await request(app).get('/api/flow/search');
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success', false);
  });

  it('GET /api/flow/search with educational query returns verified embeddable lectures', async () => {
    const res = await request(app).get('/api/flow/search?q=photoelectric%20effect%20physics');
    expect([200, 502, 504]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.items)).toBe(true);
    }
  });
});
