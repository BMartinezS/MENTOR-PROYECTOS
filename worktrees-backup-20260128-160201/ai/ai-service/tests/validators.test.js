import { validateGeneratedPlan } from '../src/validators/plan-validator.js';

describe('plan-validator', () => {
  test('rejects empty input', () => {
    expect(validateGeneratedPlan(null).ok).toBe(false);
  });

  test('accepts valid structure with required ranges', () => {
    const plan = {
      title: 'Proyecto ejemplo',
      objectives: ['O1', 'O2'],
      phases: [1, 2, 3].map((order) => ({
        name: `Fase ${order}`,
        description: 'Descripción',
        order,
        milestones: [
          {
            title: `Hito ${order}`,
            dueDate: `2026-01-0${order}`,
          },
        ],
      })),
      initialTasks: Array.from({ length: 5 }).map((_, index) => ({
        title: `Tarea ${index + 1}`,
        description: 'Hacer algo',
        estimatedHours: 2,
        priority: 'high',
        dueDate: '2026-01-05',
      })),
    };

    expect(validateGeneratedPlan(plan, { availableHours: 10 }).ok).toBe(true);
  });
});
