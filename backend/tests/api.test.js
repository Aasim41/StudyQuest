const request = require('supertest');
const app = require('../server');

describe('API Endpoints', () => {
  it('GET /api/health should return 200 and success status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
  });
});
