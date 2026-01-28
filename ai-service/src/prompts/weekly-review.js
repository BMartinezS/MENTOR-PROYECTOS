export const weeklyReviewPrompt = (data) => `
Genera una revisión semanal para el proyecto "${data.projectTitle}".

Datos de la semana:
- Tareas completadas: ${data.tasksCompleted}
- Tareas pendientes: ${data.tasksPending}
- Tareas bloqueadas: ${data.blockedTasks}
- Horas dedicadas: ${data.hoursSpent}h (meta: ${data.targetHours}h)

Genera JSON:
{
  "summary": "Resumen positivo en 1-2 oraciones",
  "questions": [
    "¿Pregunta reflexiva 1?",
    "¿Pregunta reflexiva 2?"
  ],
  "suggestions": [
    "Sugerencia específica 1",
    "Sugerencia específica 2"
  ]
}

Tono: motivador pero honesto. Si hay atraso, mencionar sin culpar.
`;

