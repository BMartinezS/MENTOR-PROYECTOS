import request from 'supertest';

import { getApp, setupDb, teardownDb } from './helpers.js';
import { Phase, User } from '../src/models/index.js';

async function createUserAndToken(app, overrides = {}) {
  const payload = {
    email: overrides.email || `proj_${Date.now()}@example.com`,
    password: overrides.password || 'securepass123',
    name: overrides.name || 'Project User',
  };
  const res = await request(app).post('/api/auth/register').send(payload);
  return { token: res.body.token, user: res.body.user };
}

beforeAll(setupDb);
afterAll(teardownDb);

test('projects CRUD includes metadata for area/planFormat', async () => {
  const app = getApp();
  const { token } = await createUserAndToken(app, { email: 'crud-project@example.com' });

  const createRes = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Proyecto 1',
      description: 'Desc',
      targetDate: '2025-04-01',
      area: 'marketing',
      planFormat: 'lean',
    });

  expect(createRes.status).toBe(201);
  expect(createRes.body.area).toBe('marketing');
  expect(createRes.body.planFormat).toBe('lean');

  const listRes = await request(app)
    .get('/api/projects')
    .set('Authorization', `Bearer ${token}`);

  expect(listRes.status).toBe(200);
  expect(listRes.body.projects[0]).toMatchObject({ area: 'marketing', planFormat: 'lean' });

  const projectId = listRes.body.projects[0].id;

  const getRes = await request(app)
    .get(`/api/projects/${projectId}`)
    .set('Authorization', `Bearer ${token}`);

  expect(getRes.status).toBe(200);
  expect(getRes.body.area).toBe('marketing');

  const patchRes = await request(app)
    .patch(`/api/projects/${projectId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'paused', planFormat: 'detailed' });

  expect(patchRes.status).toBe(200);
  expect(patchRes.body.planFormat).toBe('detailed');

  const deleteRes = await request(app)
    .delete(`/api/projects/${projectId}`)
    .set('Authorization', `Bearer ${token}`);

  expect(deleteRes.status).toBe(204);
});

test('free users can only keep one active project', async () => {
  const app = getApp();
  const { token } = await createUserAndToken(app, { email: 'limit@example.com' });

  const first = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Proyecto A' });
  expect(first.status).toBe(201);

  const second = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Proyecto B' });
  expect(second.status).toBe(403);
  expect(second.body.code).toBe('free_project_limit');
});

test('phase management enforces Pro tier and allows reorder/add', async () => {
  const app = getApp();
  const { token, user } = await createUserAndToken(app, { email: 'phase@example.com' });

  const projectRes = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Proyecto Fases' });
  const projectId = projectRes.body.id;

  const phaseA = await Phase.create({ projectId, name: 'Fase A', orderIndex: 0 });
  const phaseB = await Phase.create({ projectId, name: 'Fase B', orderIndex: 1 });

  const freeAttempt = await request(app)
    .patch(`/api/projects/${projectId}/phases/${phaseA.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Renombrada' });
  expect(freeAttempt.status).toBe(403);

  await User.update({ tier: 'pro' }, { where: { id: user.id } });

  const patchRes = await request(app)
    .patch(`/api/projects/${projectId}/phases/${phaseA.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Fase Uno', description: 'Plan' });
  expect(patchRes.status).toBe(200);
  expect(patchRes.body.phase.name).toBe('Fase Uno');

  const reorderRes = await request(app)
    .post(`/api/projects/${projectId}/phases/reorder`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      phases: [
        { id: phaseB.id },
        { name: 'Nueva Fase', description: 'Agregada' },
      ],
    });

  expect(reorderRes.status).toBe(200);
  expect(reorderRes.body.phases[0].id).toBe(phaseB.id);
  expect(reorderRes.body.phases[1].name).toBe('Nueva Fase');
  const ids = reorderRes.body.phases.map((p) => p.id);
  expect(ids).toContain(phaseA.id);
});
