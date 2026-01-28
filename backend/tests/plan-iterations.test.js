import request from 'supertest';
import axios from 'axios';
import { jest } from '@jest/globals';

import { getApp, setupDb, teardownDb } from './helpers.js';
import { Project } from '../src/models/index.js';

beforeAll(setupDb);
afterAll(teardownDb);
afterEach(() => {
  jest.restoreAllMocks();
});

test('plan iterations persist history and enforce Free limit', async () => {
  const app = getApp();

  const registerRes = await request(app).post('/api/auth/register').send({
    email: 'plan-iteration@example.com',
    password: 'securepass123',
    name: 'Planner',
  });
  const token = registerRes.body.token;
  const userId = registerRes.body.user.id;

  const project = await Project.create({ userId, title: 'Plan Iter', status: 'active' });

  jest.spyOn(axios, 'post').mockResolvedValue({
    data: {
      plan: {
        objectives: ['Obj'],
        phases: [],
        initialTasks: [],
      },
    },
  });

  const createRes = await request(app)
    .post(`/api/projects/${project.id}/plan-iterations`)
    .set('Authorization', `Bearer ${token}`)
    .send({ feedback: 'Hazlo más simple' });

  expect(createRes.status).toBe(201);
  expect(createRes.body.iteration.iterationNumber).toBe(1);
  expect(axios.post).toHaveBeenCalledWith(
    `${process.env.AI_SERVICE_URL || 'http://localhost:3001'}/plan-iteration`,
    expect.any(Object),
    expect.objectContaining({ timeout: expect.any(Number) })
  );

  const second = await request(app)
    .post(`/api/projects/${project.id}/plan-iterations`)
    .set('Authorization', `Bearer ${token}`)
    .send({ feedback: 'Otra vez' });
  expect(second.status).toBe(403);
  expect(second.body.code).toBe('free_iteration_limit');

  const listRes = await request(app)
    .get(`/api/projects/${project.id}/plan-iterations`)
    .set('Authorization', `Bearer ${token}`);

  expect(listRes.status).toBe(200);
  expect(listRes.body.iterations).toHaveLength(1);
});
