import request from 'supertest';
import { createApp } from '../src/app.js';

describe('ai-service health', () => {
  test('GET /health', async () => {
    const app = createApp();
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

