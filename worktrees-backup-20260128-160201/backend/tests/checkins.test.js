import request from 'supertest';

import { getApp, setupDb, teardownDb } from './helpers.js';
import { Checkin, Project, User } from '../src/models/index.js';
import * as CheckinService from '../src/services/checkin-service.js';

beforeAll(setupDb);
afterAll(teardownDb);

test('pending checkins and respond', async () => {
  const app = getApp();

  const registerRes = await request(app).post('/api/auth/register').send({
    email: 'c1@example.com',
    password: 'securepass123',
    name: 'C1',
  });
  const token = registerRes.body.token;
  const userId = registerRes.body.user.id;

  const project = await Project.create({ userId, title: 'P', status: 'active' });
  const checkin = await Checkin.create({
    userId,
    projectId: project.id,
    type: 'daily',
    message: '¿Lo hiciste?',
  });

  const pendingRes = await request(app)
    .get('/api/checkins/pending')
    .set('Authorization', `Bearer ${token}`);

  expect(pendingRes.status).toBe(200);
  expect(pendingRes.body.checkins.length).toBe(1);

  const respondRes = await request(app)
    .post(`/api/checkins/${checkin.id}/respond`)
    .set('Authorization', `Bearer ${token}`)
    .send({ completed: true, notes: 'sí' });

  expect(respondRes.status).toBe(200);
  expect(respondRes.body.checkin.respondedAt).toBeTruthy();
});

test('free users are limited to two weekly checkins', async () => {
  const app = getApp();

  const registerRes = await request(app).post('/api/auth/register').send({
    email: 'limit-checkin@example.com',
    password: 'securepass123',
    name: 'Limit',
  });
  const userId = registerRes.body.user.id;

  const project = await Project.create({ userId, title: 'Checkins', status: 'active' });

  await Checkin.create({ userId, projectId: project.id, type: 'daily', message: 'Ping' });
  await Checkin.create({ userId, projectId: project.id, type: 'daily', message: 'Ping 2' });

  const blocked = await CheckinService.generateAndCreate(userId, project.id);
  expect(blocked).toBeNull();

  await User.update({ tier: 'pro' }, { where: { id: userId } });

  const allowed = await CheckinService.generateAndCreate(userId, project.id);
  expect(allowed).not.toBeNull();
});
