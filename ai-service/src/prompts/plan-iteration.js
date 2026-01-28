import { formatAreaGuidance, resolveAreaTemplate } from './plan-templates.js';

const stringifyPlan = (plan) => JSON.stringify(plan, null, 2);

export const generatePlanIterationPrompt = ({
  idea,
  availableHours,
  targetDate,
  feedback,
  projectArea,
  previousPlan,
}) => {
  const template = resolveAreaTemplate(projectArea);
  return `
Eres un mentor de proyectos senior. Debes actualizar un plan existente manteniendo identificadores estables cuando el trabajo sea el mismo.

Contexto inicial: ${idea || 'Proyecto en ejecución'}
Disponibilidad semanal: ${availableHours ? `${availableHours} horas` : 'similar a la versión previa'}
Fecha objetivo: ${targetDate || 'igual a la versión previa'}
Feedback del usuario:
"""
${feedback}
"""

${formatAreaGuidance(template)}

Plan vigente (JSON):
${stringifyPlan(previousPlan)}

Genera una nueva versión en **JSON válido** siguiendo la misma estructura (title, projectArea, objectives, phases con ids y milestones con ids, initialTasks con ids y phaseId). Mantén los IDs existentes si el elemento persiste; crea nuevos si cambias o agregas elementos.
`;
};
