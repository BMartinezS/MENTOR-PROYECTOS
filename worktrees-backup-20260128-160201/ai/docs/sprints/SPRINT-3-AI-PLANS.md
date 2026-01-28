# Sprint 3: Generación de Planes con IA

**Duración**: 2-3 días  
**Branch**: `feature/ai-plans`

---

## AI Service

### Prompt Template
`ai-service/src/prompts/generate-plan.js`:
```javascript
export const generatePlanPrompt = (idea, availableHours, targetDate) => `
Eres un mentor de proyectos para emprendedores. Un usuario quiere: "${idea}".

Contexto:
- Disponibilidad: ${availableHours} horas/semana
- Fecha objetivo: ${targetDate}

Genera un plan realista en JSON con esta estructura EXACTA:

{
  "title": "Título claro del proyecto (max 60 caracteres)",
  "objectives": [
    "Objetivo concreto 1",
    "Objetivo concreto 2",
    "Objetivo concreto 3"
  ],
  "phases": [
    {
      "name": "Nombre de fase",
      "description": "Breve descripción",
      "order": 1,
      "milestones": [
        {
          "title": "Hito medible",
          "dueDate": "YYYY-MM-DD"
        }
      ]
    }
  ],
  "initialTasks": [
    {
      "title": "Tarea específica y accionable",
      "description": "Qué hacer exactamente",
      "estimatedHours": 2,
      "priority": "high",
      "dueDate": "YYYY-MM-DD"
    }
  ]
}

Reglas críticas:
1. 3-5 fases máximo
2. 1-3 hitos por fase
3. 5-8 tareas iniciales (primera semana)
4. Tareas NO deben superar horas disponibles semanales
5. Fechas coherentes con targetDate
6. Prioridades: high/medium/low
7. Responde SOLO JSON válido, sin markdown ni texto adicional

Importante: Las tareas deben ser super específicas, no generales.
`;
```

### AI Controller
`ai-service/src/controllers/ai-controller.js`:
```javascript
import OpenAI from 'openai';
import { generatePlanPrompt } from '../prompts/generate-plan.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generatePlan = async (req, res) => {
  try {
    const { idea, availableHoursPerWeek, targetDate } = req.body;
    
    const prompt = generatePlanPrompt(idea, availableHoursPerWeek, targetDate);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: "Eres un mentor de proyectos experto. Respondes SOLO con JSON válido." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    const plan = JSON.parse(completion.choices[0].message.content);
    
    // Validación básica
    if (!plan.title || !plan.objectives || !plan.phases || !plan.initialTasks) {
      throw new Error('Invalid plan structure');
    }
    
    res.json(plan);
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: error.message });
  }
};
```

`ai-service/src/index.js`:
```javascript
import { generatePlan } from './controllers/ai-controller.js';

app.post('/generate-plan', generatePlan);
```

---

## Backend

### Project Service - AI Integration
`backend/src/services/project-service.js` - agregar:
```javascript
import axios from 'axios';

export const createWithAI = async (userId, { idea, availableHoursPerWeek, targetDate }) => {
  // 1. Llamar AI Service
  const aiResponse = await axios.post('http://localhost:3001/generate-plan', {
    idea,
    availableHoursPerWeek,
    targetDate
  });
  
  const plan = aiResponse.data;
  
  // 2. Crear proyecto
  const project = await Project.create({
    userId,
    title: plan.title,
    description: idea,
    targetDate,
    status: 'active',
    progress: 0
  });
  
  // 3. Crear objectives
  for (const obj of plan.objectives) {
    await Objective.create({
      projectId: project.id,
      description: obj,
      orderIndex: plan.objectives.indexOf(obj)
    });
  }
  
  // 4. Crear phases + milestones
  for (const phaseData of plan.phases) {
    const phase = await Phase.create({
      projectId: project.id,
      name: phaseData.name,
      description: phaseData.description,
      orderIndex: phaseData.order
    });
    
    for (const milestoneData of phaseData.milestones) {
      await Milestone.create({
        phaseId: phase.id,
        title: milestoneData.title,
        dueDate: milestoneData.dueDate
      });
    }
  }
  
  // 5. Crear initial tasks
  for (const taskData of plan.initialTasks) {
    await Task.create({
      projectId: project.id,
      title: taskData.title,
      description: taskData.description,
      estimatedHours: taskData.estimatedHours,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      status: 'pending'
    });
  }
  
  // 6. Retornar proyecto completo
  return await getById(userId, project.id);
};
```

### Routes
`backend/src/routes/projects.js` - agregar:
```javascript
router.post('/ai-plan', authenticate, async (req, res, next) => {
  try {
    const project = await ProjectService.createWithAI(req.user.id, req.body);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});
```

---

## Frontend

### Create Project with AI
`frontend/src/pages/CreateProject.jsx`:
```jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateProject() {
  const [idea, setIdea] = useState('');
  const [hours, setHours] = useState(10);
  const [targetDate, setTargetDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post(
        'http://localhost:3000/api/projects/ai-plan',
        {
          idea,
          availableHoursPerWeek: hours,
          targetDate
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      navigate(`/project/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al generar plan');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Crear Proyecto con IA</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-2">
            ¿Qué proyecto quieres hacer?
          </label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            rows="4"
            placeholder="Ej: Quiero lanzar un curso online de JavaScript en 2 meses"
            required
          />
        </div>
        
        <div>
          <label className="block font-medium mb-2">
            ¿Cuántas horas por semana puedes dedicar?
          </label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            min="1"
            max="40"
            required
          />
        </div>
        
        <div>
          <label className="block font-medium mb-2">
            Fecha objetivo
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Generando plan...' : 'Crear Proyecto'}
        </button>
      </form>
    </div>
  );
}

export default CreateProject;
```

---

## Criterios de aceptación
- [ ] IA genera plan coherente desde descripción natural
- [ ] Plan tiene 3-5 fases
- [ ] Tareas iniciales respetan horas disponibles
- [ ] Fechas son realistas según targetDate
- [ ] Proyecto se crea con objectives, phases, milestones, tasks
- [ ] Frontend muestra plan generado
- [ ] Manejo de errores si IA falla

**Próximo**: Sprint 4 - Check-ins
