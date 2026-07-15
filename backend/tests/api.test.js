const request = require('supertest');
const app = require('../server');

describe('API Endpoints', () => {
  it('GET /api/health should return 200 and success status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('GET /api/colleges/search without query should return 400', async () => {
    const res = await request(app).get('/api/colleges/search');
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/schedule/merge/generate without data should return 400', async () => {
    const res = await request(app)
      .post('/api/schedule/merge/generate')
      .send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });
});
