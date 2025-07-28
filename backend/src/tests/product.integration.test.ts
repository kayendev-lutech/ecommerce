import request from 'supertest';
import app from '../app';

describe('Product API Integration', () => {
  it('GET /api/v1/product trả về 200 và có data', async () => {
    const res = await request(app).get('/api/v1/product');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('POST /api/v1/product trả về lỗi nếu thiếu category_id', async () => {
    const res = await request(app)
      .post('/api/v1/product')
      .send({ name: 'Test Product', price: 100 });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
