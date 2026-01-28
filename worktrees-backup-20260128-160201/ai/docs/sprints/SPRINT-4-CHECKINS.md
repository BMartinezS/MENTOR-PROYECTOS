# Sprint 4: Sistema de Check-ins

**Duración**: 2 días  
**Branch**: `feature/checkins`

---

## AI Service

`ai-service/src/prompts/checkin.js`:
```javascript
export const checkinPrompt = (context) => `
Genera un mensaje de check-in para el usuario ${context.userName}.

Contexto:
- Última tarea completada: ${context.lastTask || 'ninguna'}
- Próxima tarea: ${context.nextTask}
- Días sin progreso: ${context.daysSinceProgress}
- Proyecto: ${context.projectTitle}

Genera un mensaje corto (max 150 caracteres) que:
1. Sea amable pero directo
2. Mencione el momentum si hay avance reciente
3. Pregunte específicamente sobre la próxima tarea
4. Use tono ${context.tone} (normal/suave/directo)

Responde SOLO el mensaje, sin comillas ni formato adicional.
`;
```

`ai-service/src/controllers/ai-controller.js` - agregar:
```javascript
export const generateCheckin = async (req, res) => {
  const { context } = req.body;
  const prompt = checkinPrompt(context);
  
  const completion = await openai.chat.completions.create({
    model: "gpt-5-nano",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
    max_tokens: 100
  });
  
  res.json({ message: completion.choices[0].message.content.trim() });
};
```

---

## Backend

### Checkin Model
Ver `DB-SCHEMA.md` para schema completo.

### Checkin Service
`backend/src/services/checkin-service.js`:
```javascript
import Checkin from '../models/Checkin.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import axios from 'axios';

export const generateAndCreate = async (userId, projectId) => {
  const project = await Project.findByPk(projectId, {
    include: [{ model: Task, where: { status: 'pending' }, limit: 1 }]
  });
  
  const context = {
    userName: project.User.name,
    projectTitle: project.title,
    nextTask: project.Tasks[0]?.title || 'iniciar proyecto',
    daysSinceProgress: 0, // TODO: calcular
    tone: 'normal'
  };
  
  const aiRes = await axios.post('http://localhost:3001/generate-checkin', { context });
  
  return await Checkin.create({
    userId,
    projectId,
    type: 'daily',
    message: aiRes.data.message
  });
};

export const respond = async (checkinId, userId, response) => {
  const checkin = await Checkin.findOne({ where: { id: checkinId, userId } });
  if (!checkin) throw new Error('Checkin not found');
  
  return await checkin.update({
    respondedAt: new Date(),
    response
  });
};

export const getPending = async (userId) => {
  return await Checkin.findAll({
    where: { userId, respondedAt: null },
    include: [Project],
    order: [['createdAt', 'ASC']]
  });
};
```

### Cron Job (simple)
`backend/src/jobs/checkin-scheduler.js`:
```javascript
import cron from 'node-cron';
import * as CheckinService from '../services/checkin-service.js';
import Project from '../models/Project.js';

// Ejecutar cada día a las 9am
export const startCheckinScheduler = () => {
  cron.schedule('0 9 * * *', async () => {
    const activeProjects = await Project.findAll({
      where: { status: 'active' }
    });
    
    for (const project of activeProjects) {
      // Verificar si ya tiene checkin hoy
      const today = new Date().setHours(0,0,0,0);
      const existing = await Checkin.findOne({
        where: {
          projectId: project.id,
          createdAt: { [Op.gte]: today }
        }
      });
      
      if (!existing) {
        await CheckinService.generateAndCreate(project.userId, project.id);
      }
    }
  });
};
```

Agregar en `src/index.js`:
```javascript
import { startCheckinScheduler } from './jobs/checkin-scheduler.js';
startCheckinScheduler();
```

### Routes
`backend/src/routes/checkins.js`:
```javascript
router.get('/pending', authenticate, async (req, res) => {
  const checkins = await CheckinService.getPending(req.user.id);
  res.json({ checkins });
});

router.post('/:id/respond', authenticate, async (req, res) => {
  const checkin = await CheckinService.respond(
    req.params.id,
    req.user.id,
    req.body
  );
  res.json(checkin);
});
```

---

## Frontend

`frontend/src/pages/Checkins.jsx`:
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Checkins() {
  const [checkins, setCheckins] = useState([]);
  
  useEffect(() => {
    loadCheckins();
  }, []);
  
  const loadCheckins = async () => {
    const res = await axios.get('http://localhost:3000/api/checkins/pending', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setCheckins(res.data.checkins);
  };
  
  const handleRespond = async (checkinId, completed, notes) => {
    await axios.post(
      `http://localhost:3000/api/checkins/${checkinId}/respond`,
      { completed, notes },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    loadCheckins();
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Check-ins pendientes</h1>
      
      {checkins.map(checkin => (
        <div key={checkin.id} className="bg-white p-4 rounded shadow mb-4">
          <p className="font-medium">{checkin.Project.title}</p>
          <p className="text-gray-700 my-3">{checkin.message}</p>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleRespond(checkin.id, true, 'Sí')}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              ✓ Sí, lo hice
            </button>
            <button
              onClick={() => handleRespond(checkin.id, false, 'No pude')}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              ✗ No pude
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Checkins;
```

---

## Criterios
- [ ] Cron genera check-ins diarios
- [ ] IA personaliza mensajes
- [ ] Usuario responde sí/no + notas
- [ ] Check-ins se marcan como respondidos
- [ ] Frontend muestra pendientes
