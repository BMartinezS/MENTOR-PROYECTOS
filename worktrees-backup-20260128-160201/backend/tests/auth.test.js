import request from 'supertest';

import { getApp, setupDb, teardownDb } from './helpers.js';

beforeAll(setupDb);
afterAll(teardownDb);

test('register/login/profile flow', async () => {
  const app = getApp();

  const registerRes = await request(app).post('/api/auth/register').send({
    email: 'user@example.com',
    password: 'securepass123',
    name: 'Juan',
    timezone: 'America/Santiago',
  });

  expect(registerRes.status).toBe(201);
  expect(registerRes.body.token).toBeTruthy();
  expect(registerRes.body.user.email).toBe('user@example.com');
  expect(registerRes.body.user.passwordHash).toBeUndefined();

  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'user@example.com',
    password: 'securepass123',
  });

  expect(loginRes.status).toBe(200);
  expect(loginRes.body.token).toBeTruthy();

  const profileRes = await request(app)
    .get('/api/auth/profile')
    .set('Authorization', `Bearer ${loginRes.body.token}`);

  expect(profileRes.status).toBe(200);
  expect(profileRes.body.email).toBe('user@example.com');
});

