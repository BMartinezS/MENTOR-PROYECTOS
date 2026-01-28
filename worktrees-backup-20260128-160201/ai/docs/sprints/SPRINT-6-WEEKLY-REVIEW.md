# Sprint 6: Revisión Semanal

**Duración**: 1-2 días  
**Branch**: `feature/weekly-review`

---

## AI Service

### Prompt
`ai-service/src/prompts/weekly-review.js`:
```javascript
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
```

### Controller
```javascript
export const generateWeeklyReview = async (req, res) => {
  const prompt = weeklyReviewPrompt(req.body.data);
  
  const completion = await openai.chat.completions.create({
    model: "gpt-5-nano",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });
  
  res.json(JSON.parse(completion.choices[0].message.content));
};
```

---

## Backend

### Service
`backend/src/services/weekly-review-service.js`:
```javascript
export const generate = async (userId, projectId) => {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  
  const tasks = await Task.findAll({
    where: { projectId },
    include: [ProgressLog]
  });
  
  const data = {
    projectTitle: project.title,
    tasksCompleted: tasks.filter(t => 
      t.status === 'completed' && 
      new Date(t.completedAt) >= weekStart
    ).length,
    tasksPending: tasks.filter(t => t.status === 'pending').length,
    blockedTasks: tasks.filter(t => t.status === 'blocked').length,
    hoursSpent: tasks.reduce((sum, t) => 
      t.status === 'completed' ? sum + (t.estimatedHours || 0) : sum, 0
    ),
    targetHours: 10 // TODO: from user preferences
  };
  
  const aiRes = await axios.post('http://localhost:3001/weekly-review', { data });
  
  return await WeeklyReview.create({
    projectId,
    userId,
    weekStartDate: weekStart,
    weekEndDate: new Date(),
    ...aiRes.data
  });
};

export const saveAnswers = async (reviewId, userId, answers) => {
  const review = await WeeklyReview.findOne({ where: { id: reviewId, userId } });
  return await review.update({ userAnswers: answers });
};
```

### Cron Job
```javascript
// En backend/src/jobs/review-scheduler.js
cron.schedule('0 18 * * 0', async () => { // Domingos 6pm
  const activeProjects = await Project.findAll({ where: { status: 'active' } });
  
  for (const project of activeProjects) {
    await WeeklyReviewService.generate(project.userId, project.id);
  }
});
```

---

## Frontend

`frontend/src/pages/WeeklyReview.jsx`:
```jsx
import React, { useState, useEffect } from 'react';

function WeeklyReview({ projectId }) {
  const [review, setReview] = useState(null);
  const [answers, setAnswers] = useState({});
  
  useEffect(() => {
    loadReview();
  }, []);
  
  const loadReview = async () => {
    const res = await api.getWeeklyReview(projectId);
    setReview(res.data);
  };
  
  const handleSubmit = async () => {
    await api.saveReviewAnswers(review.id, answers);
    navigate('/dashboard');
  };
  
  if (!review) return <div>Cargando...</div>;
  
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Revisión Semanal</h1>
      
      <div className="bg-blue-50 p-4 rounded mb-6">
        <p className="text-lg">{review.summary}</p>
      </div>
      
      <div className="space-y-4 mb-6">
        {review.suggestions?.map((sugg, i) => (
          <div key={i} className="bg-yellow-50 p-3 rounded">
            <p>💡 {sugg}</p>
          </div>
        ))}
      </div>
      
      <div className="space-y-4">
        {review.questions?.map((q, i) => (
          <div key={i}>
            <label className="block font-medium mb-2">{q}</label>
            <textarea
              onChange={(e) => setAnswers({...answers, [i]: e.target.value})}
              className="w-full border rounded p-2"
              rows="2"
            />
          </div>
        ))}
      </div>
      
      <button
        onClick={handleSubmit}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded"
      >
        Guardar y Continuar
      </button>
    </div>
  );
}
```

---

## Criterios
- [ ] Cron semanal genera reviews
- [ ] IA resume progreso
- [ ] Preguntas reflexivas personalizadas
- [ ] Usuario responde preguntas
- [ ] Respuestas guardadas en JSONB
- [ ] UI muestra review visualmente

---

## MVP COMPLETO ✅
Con Sprint 6 terminas el MVP funcional.
