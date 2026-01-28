import { formatAreaGuidance, resolveAreaTemplate } from './plan-templates.js';

export const generatePlanPrompt = ({ idea, availableHours, targetDate, projectArea }) => {
  const template = resolveAreaTemplate(projectArea);
  return `
Eres un mentor de proyectos para emprendedores. El usuario quiere: "${idea}".

Contexto operativo:
- Disponibilidad semanal: ${availableHours} horas
- Fecha objetivo: ${targetDate}
- ${formatAreaGuidance(template)}

Devuelve un plan realista en JSON con esta estructura EXACTA (sin Markdown, sin comentarios):
{
  "title": "Título claro del proyecto (max 60 caracteres)",
  "projectArea": "${template.key}",
  "objectives": ["Objetivo 1", "Objetivo 2", "Objetivo 3"],
  "phases": [
    {
      "id": "phase-marketing-topline",
      "name": "Nombre de fase",
      "description": "Breve descripción",
      "order": 1,
      "milestones": [
        {
          "id": "milestone-topline",
          "title": "Hito medible",
          "dueDate": "YYYY-MM-DD"
        }
      ]
    }
  ],
  "initialTasks": [
    {
      "id": "task-algo",
      "title": "Tarea específica y accionable",
      "description": "Qué hacer exactamente",
      "estimatedHours": 2,
      "priority": "high",
      "dueDate": "YYYY-MM-DD",
      "phaseId": "phase-marketing-topline"
    }
  ]
}

Reglas críticas:
1. Entre 3 y 5 fases máximo con órdenes consecutivos.
2. Cada fase debe incluir 1-3 hitos.
3. Genera entre 5 y 8 tareas iniciales (primera semana) respetando las ${availableHours} horas disponibles.
4. Prioridades válidas: high/medium/low.
5. Las fechas deben ser coherentes con ${targetDate}.
6. Tareas súper específicas, accionables y asignadas a una fase vía "phaseId".
7. Responde SOLO JSON válido.
`;
};
