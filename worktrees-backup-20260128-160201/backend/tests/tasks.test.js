import request from 'supertest';

import { getApp, setupDb, teardownDb } from './helpers.js';
import { Project, Task, User } from '../src/models/index.js';

beforeAll(setupDb);
afterAll(teardownDb);

async function registerUser(app, email) {
  const res = await request(app).post('/api/auth/register').send({
    email,
    password: 'securepass123',
    name: 'Task User',
  });
  return { token: res.body.token, user: res.body.user };
}

test('complete task creates progress log and updates progress', async () => {
  const app = getApp();

  const { token, user } = await registerUser(app, 't1@example.com');

  const project = await Project.create({ userId: user.id, title: 'P', status: 'active' });
  const task = await Task.create({ projectId: project.id, title: 'Do it' });

  const res = await request(app)
    .patch(`/api/tasks/${task.id}/complete`)
    .set('Authorization', `Bearer ${token}`)
    .send({ notes: 'done', evidenceUrl: 'https://example.com' });

  expect(res.status).toBe(200);
  expect(res.body.task.status).toBe('completed');

  const refreshed = await Project.findByPk(project.id);
  expect(refreshed.progress).toBe(100);
});

test('task detail includes extended metadata', async () => {
  const app = getApp();
  const { token, user } = await registerUser(app, 'task-detail@example.com');

  const project = await Project.create({ userId: user.id, title: 'Detalles', status: 'active' });
  const task = await Task.create({
    projectId: project.id,
    title: 'Investigar',
    description: 'Analizar mercado',
    deliverables: ['Informe inicial'],
    dependencies: ['Brief aprobado'],
    metrics: [{ name: 'Leads', target: '20' }],
    notes: 'Revisar benchmark',
  });

  const res = await request(app)
    .get(`/api/tasks/${task.id}`)
    .set('Authorization', `Bearer ${token}`);

  expect(res.status).toBe(200);
  expect(res.body.task.deliverables).toContain('Informe inicial');
  expect(res.body.task.metrics[0].name).toBe('Leads');
});

test('only Pro users can update task details', async () => {
  const app = getApp();
  const { token, user } = await registerUser(app, 'task-pro@example.com');

  const project = await Project.create({ userId: user.id, title: 'Editable', status: 'active' });
  const task = await Task.create({ projectId: project.id, title: 'Diseñar landing' });

  const freeRes = await request(app)
    .patch(`/api/tasks/${task.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Landing hero' });
  expect(freeRes.status).toBe(403);

  await User.update({ tier: 'pro' }, { where: { id: user.id } });

  const patchRes = await request(app)
    .patch(`/api/tasks/${task.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Landing hero',
      notes: 'Agregar prueba social',
      responsible: 'Equipo Growth',
      dueDate: '2025-02-01',
      deliverables: ['Wireframe', 'Mockup'],
      metrics: [{ name: 'CTR', target: '4%' }],
    });

  expect(patchRes.status).toBe(200);
  expect(patchRes.body.task.responsible).toBe('Equipo Growth');
  expect(patchRes.body.task.deliverables.length).toBe(2);
});
