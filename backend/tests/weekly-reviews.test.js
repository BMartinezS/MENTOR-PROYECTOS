import request from 'supertest';
import axios from 'axios';
import { jest } from '@jest/globals';

import { getApp, setupDb, teardownDb } from './helpers.js';
import { Project, Task } from '../src/models/index.js';

beforeAll(setupDb);
afterAll(teardownDb);
afterEach(() => {
  jest.restoreAllMocks();
});

test('weekly review flow generates report and stores answers', async () => {
  const app = getApp();

  const registerRes = await request(app).post('/api/auth/register').send({
    email: 'weekly@example.com',
    password: 'securepass123',
    name: 'Weekly User',
  });
  const token = registerRes.body.token;
  const userId = registerRes.body.user.id;

  const project = await Project.create({ userId, title: 'Weekly Project', status: 'active' });
  await Task.create({
    projectId: project.id,
    title: 'Task done',
    status: 'completed',
    completedAt: new Date(),
    estimatedHours: 3,
  });

  jest.spyOn(axios, 'post').mockResolvedValue({
    data: {
      summary: 'Semana productiva',
      questions: ['Que aprendiste?'],
      suggestions: ['Planifica el siguiente sprint'],
    },
  });

  const reviewRes = await request(app)
    .get(`/api/weekly-reviews/projects/${project.id}`)
    .set('Authorization', `Bearer ${token}`);

  expect(reviewRes.status).toBe(200);
  expect(reviewRes.body.review.summary).toContain('Semana productiva');
  expect(axios.post).toHaveBeenCalledWith(
    `${process.env.AI_SERVICE_URL || 'http://localhost:3001'}/weekly-review`,
    expect.any(Object),
    expect.objectContaining({ timeout: expect.any(Number) })
  );

  const reviewId = reviewRes.body.review.id;

  const answersRes = await request(app)
    .post(`/api/weekly-reviews/${reviewId}/answers`)
    .set('Authorization', `Bearer ${token}`)
    .send({ answers: { '0': 'Todo bien' } });

  expect(answersRes.status).toBe(200);
  expect(answersRes.body.review.userAnswers['0']).toBe('Todo bien');
});
