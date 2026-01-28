import { jest } from '@jest/globals';
import request from 'supertest';

jest.setTimeout(15000);

describe('checkin + weekly review endpoints', () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.resetModules();
    delete process.env.OPENAI_API_KEY;
  });

  test('POST /generate-checkin returns 400 on invalid context', async () => {
    const { createApp } = await import('../src/app.js');
    const app = createApp();

    const res = await request(app).post('/generate-checkin').send({});
    expect(res.statusCode).toBe(400);
  });

  test('POST /generate-checkin returns 200 with mocked message', async () => {
    jest.unstable_mockModule('../src/lib/openai-client.js', () => ({
      createOpenAIClient: () => ({
        chat: {
          completions: {
            create: async () => ({
              choices: [{ message: { content: 'Hola! ¿Pudiste avanzar con la próxima tarea?' } }],
            }),
          },
        },
      }),
    }));

    const { createApp } = await import('../src/app.js');
    const app = createApp();

    const res = await request(app).post('/generate-checkin').send({
      context: {
        userName: 'Juan',
        lastTask: 'Definir alcance',
        nextTask: 'Escribir el outline',
        daysSinceProgress: 2,
        projectTitle: 'Curso',
        tone: 'normal',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(typeof res.body.message).toBe('string');
    expect(res.body.message.length).toBeGreaterThan(0);
    expect(res.body.message.length).toBeLessThanOrEqual(150);
  });

  test('POST /weekly-review returns 400 on invalid data', async () => {
    const { createApp } = await import('../src/app.js');
    const app = createApp();

    const res = await request(app).post('/weekly-review').send({});
    expect(res.statusCode).toBe(400);
  });

  test('POST /weekly-review returns 200 with mocked json', async () => {
    const review = {
      summary: 'Buen progreso esta semana.',
      questions: ['¿Qué fue lo más difícil?', '¿Qué repetirías?'],
      suggestions: ['Bloquea 1h diaria', 'Define el siguiente hito'],
    };

    jest.unstable_mockModule('../src/lib/openai-client.js', () => ({
      createOpenAIClient: () => ({
        responses: {
          create: async () => ({ output_text: JSON.stringify(review) }),
        },
        chat: {
          completions: { create: async () => ({}) },
        },
      }),
    }));

    const { createApp } = await import('../src/app.js');
    const app = createApp();

    const res = await request(app).post('/weekly-review').send({
      data: {
        projectTitle: 'Proyecto X',
        tasksCompleted: 3,
        tasksPending: 5,
        blockedTasks: 1,
        hoursSpent: 6,
        targetHours: 10,
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.summary).toBe(review.summary);
    expect(Array.isArray(res.body.questions)).toBe(true);
    expect(Array.isArray(res.body.suggestions)).toBe(true);
  });

  test('POST /weekly-review returns 500 on invalid AI json', async () => {
    jest.unstable_mockModule('../src/lib/openai-client.js', () => ({
      createOpenAIClient: () => ({
        responses: {
          create: async () => ({ output_text: 'not-json' }),
        },
        chat: {
          completions: { create: async () => ({}) },
        },
      }),
    }));

    const { createApp } = await import('../src/app.js');
    const app = createApp();

    const res = await request(app).post('/weekly-review').send({
      data: {
        projectTitle: 'Proyecto X',
        tasksCompleted: 3,
        tasksPending: 5,
        blockedTasks: 1,
        hoursSpent: 6,
        targetHours: 10,
      },
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Invalid AI response');
  });
});
