import { jest } from '@jest/globals';
import request from 'supertest';

jest.setTimeout(15000);

describe('POST /generate-plan', () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.resetModules();
    delete process.env.OPENAI_API_KEY;
  });

  test('returns 400 on missing fields', async () => {
    const { createApp } = await import('../src/app.js');
    const app = createApp();

    const res = await request(app).post('/generate-plan').send({ idea: 'x' });
    expect(res.statusCode).toBe(400);
  });

  test('returns 500 when OPENAI_API_KEY missing', async () => {
    const { createApp } = await import('../src/app.js');
    const app = createApp();

    const res = await request(app).post('/generate-plan').send({
      idea: 'Quiero hacer X',
      availableHoursPerWeek: 10,
      targetDate: '2026-12-31',
      projectArea: 'marketing',
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('AI service error');
  });

  test('returns 200 with a valid mocked plan', async () => {
    const plan = {
      title: 'Proyecto de prueba',
      projectArea: 'marketing',
      objectives: ['Obj 1', 'Obj 2'],
      phases: [
        {
          id: 'phase-alpha',
          name: 'Descubrimiento',
          description: 'Descubre',
          order: 1,
          milestones: [{ id: 'm1', title: 'Hito 1', dueDate: '2026-01-10' }],
        },
        {
          id: 'phase-beta',
          name: 'Validación',
          description: 'Valida',
          order: 2,
          milestones: [{ id: 'm2', title: 'Hito 2', dueDate: '2026-01-20' }],
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
        dueDate: '2026-01-05',
        phaseId: 'phase-alpha',
      })),
    };

    jest.unstable_mockModule('../src/lib/openai-client.js', () => ({
      createOpenAIClient: () => ({
        responses: {
          create: async () => ({ output_text: JSON.stringify(plan) }),
        },
        chat: {
          completions: { create: async () => ({}) },
        },
      }),
    }));

    const { createApp } = await import('../src/app.js');
    const app = createApp();

    const res = await request(app).post('/generate-plan').send({
      idea: 'Quiero hacer X',
      availableHoursPerWeek: 10,
      targetDate: '2026-12-31',
      projectArea: 'marketing',
      projectId: 'proj-123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe(plan.title);
    expect(res.body.projectArea).toBe('marketing');
    expect(res.body.phases[0].id).toBeDefined();
    expect(res.body.initialTasks).toHaveLength(5);
    expect(res.body.initialTasks[0].id).toBeDefined();
  });
});

describe('POST /test', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('returns 200 with mocked message', async () => {
    jest.unstable_mockModule('../src/lib/openai-client.js', () => ({
      createOpenAIClient: () => ({
        chat: {
          completions: {
            create: async () => ({
              choices: [{ message: { content: 'AI Service OK' } }],
            }),
          },
        },
      }),
    }));

    const { createApp } = await import('../src/app.js');
    const app = createApp();

    const res = await request(app).post('/test').send({});
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('AI Service OK');
  });
});
