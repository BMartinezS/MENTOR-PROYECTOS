const safeText = (value) => (value ? value : '');

export const suggestTaskSplitPrompt = ({ task, projectContext, maxSubtasks }) => `
Eres un asistente experto en gestión de proyectos. El usuario considera que la tarea siguiente es demasiado grande:
Tarea: ${task.title}
Descripción: ${safeText(task.description)}
Estimado actual: ${task.estimatedHours ?? 'sin dato'} horas

Contexto del proyecto:
${safeText(projectContext)}

Divide la tarea en máximo ${maxSubtasks} subtareas accionables.
Devuelve JSON válido con esta estructura exacta:
{
  "subtasks": [
    {
      "id": "subtask-slug",
      "title": "Subtarea concreta",
      "description": "Qué hacer",
      "estimatedHours": 1.5
    }
  ]
}

Reglas:
- Cada subtarea debe ser realizable en <= 40% del tiempo original (si no hay estimado, asume 2h máximo).
- Subtareas deben poder ejecutarse de forma independiente.
- Ordena de forma lógica de ejecución.
- Solo responde con el JSON, sin texto adicional.
`;
