import { jest } from '@jest/globals';
import request from 'supertest';

jest.setTimeout(15000);

const buildPlan = () => ({
  title: 'Proyecto ejemplo',
  projectArea: 'marketing',
  objectives: ['O1', 'O2'],
  phases: [
    {
      id: 'phase-alpha',
      name: 'Descubrimiento',
      description: 'Descubre',
      order: 1,
      milestones: [{ id: 'm1', title: 'Hito 1', dueDate: '2026-01-05' }],
    },
    {
      id: 'phase-beta',
      name: 'Validación',
      description: 'Valida',
      order: 2,
      milestones: [{ id: 'm2', title: 'Hito 2', dueDate: '2026-01-15' }],
    },
    {
      id: 'phase-gamma',
      name: 'Lanzamiento',
      description: 'Lanza',
      order: 3,
      milestones: [{ id: 'm3', title: 'Hito 3', dueDate: '2026-01-30' }],
    },
  ],
  initialTasks: Array.from({ length: 5 }).map((_, index) => ({
    id: `task-${index + 1}`,
    title: `Tarea ${index + 1}`,
    description: 'Hacer algo',
    estimatedHours: 2,
    priority: 'high',
    dueDate: '2026-01-08',
  })),
});

describe('plan iteration endpoint', () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.resetModules();
    delete process.env.OPENAI_API_KEY;
  });

  test('returns 400 when payload missing previous plan', async () => {
    const { createApp } = await import('../src/app.js');
    const app = createApp();

    const res = await request(app)
      .post('/plans/abc/iterations')
      .send({ feedback: 'algo', previousPlan: null });

    expect(res.statusCode).toBe(400);
  });

  test('returns 403 for free tier second iteration', async () => {
    const { createApp } = await import('../src/app.js');
    const app = createApp();

    const res = await request(app)
      .post('/plans/abc/iterations')
      .send({ feedback: 'algo', previousPlan: buildPlan(), userTier: 'free', existingIterations: 1 });

    expect(res.statusCode).toBe(403);
  });

  test('returns 200 for valid iteration', async () => {
    const updatedPlan = buildPlan();
    updatedPlan.objectives.push('O3');

    jest.unstable_mockModule('../src/lib/openai-client.js', () => ({
      createOpenAIClient: () => ({
        responses: {
          create: async () => ({ output_text: JSON.stringify(updatedPlan) }),
        },
        chat: {
          completions: { create: async () => ({}) },
        },
      }),
    }));

    const { createApp } = await import('../src/app.js');
    const app = createApp();

    const res = await request(app)
      .post('/plans/proj-123/iterations')
      .send({
        previousPlan: buildPlan(),
        feedback: 'haz más foco en acquisition',
        availableHoursPerWeek: 12,
        userTier: 'pro',
        existingIterations: 2,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.plan.objectives).toHaveLength(3);
    expect(res.body.plan.phases[0].id).toBeDefined();
    expect(res.body.iteration).toBe(3);
  });
});

describe('suggest-task-split endpoint', () => {
  beforeEach(() => {
    jest.resetModules();
    delete process.env.OPENAI_API_KEY;
  });

  test('returns 400 when task missing', async () => {
    const { createApp } = await import('../src/app.js');
    const app = createApp();

    const res = await request(app).post('/suggest-task-split').send({});
    expect(res.statusCode).toBe(400);
  });

  test('returns subtasks when AI responds with valid JSON', async () => {
    const split = {
      subtasks: [
        { id: 'sub-1', title: 'Preparar guion', description: 'Lista de temas', estimatedHours: 1 },
        { id: 'sub-2', title: 'Grabar piloto', description: 'Video corto', estimatedHours: 1.5 },
      ],
    };

    jest.unstable_mockModule('../src/lib/openai-client.js', () => ({
      createOpenAIClient: () => ({
        responses: {
          create: async () => ({ output_text: JSON.stringify(split) }),
        },
        chat: {
          completions: { create: async () => ({}) },
        },
      }),
    }));

    const { createApp } = await import('../src/app.js');
    const app = createApp();

    const res = await request(app)
      .post('/suggest-task-split')
      .send({
        task: { title: 'Crear curso', description: 'Grabar todo el curso', estimatedHours: 8 },
        projectContext: 'Lanzamiento de curso',
        maxSubtasks: 3,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.subtasks).toHaveLength(2);
    expect(res.body.subtasks[0].id).toBeDefined();
  });
});
