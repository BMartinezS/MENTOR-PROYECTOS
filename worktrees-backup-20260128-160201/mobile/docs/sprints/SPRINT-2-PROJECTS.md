# Sprint 2: CRUD de Proyectos

**Duración**: 2-3 días  
**Branch**: `feature/projects-crud`

---

## Backend

### Modelos
Crear en `backend/src/models/`:
- `Project.js` - Ver DB-SCHEMA.md
- `Objective.js`
- `Phase.js` 
- `Milestone.js`
- `Task.js`

Relaciones:
```javascript
// En backend/src/models/associations.js
User.hasMany(Project);
Project.belongsTo(User);
Project.hasMany(Objective);
Project.hasMany(Phase);
Phase.hasMany(Milestone);
Project.hasMany(Task);
```

### Service
`backend/src/services/project-service.js`:
```javascript
export const create = async (userId, { title, description, targetDate }) => {
  return await Project.create({
    userId,
    title,
    description,
    targetDate,
    status: 'active',
    progress: 0
  });
};

export const getAll = async (userId) => {
  return await Project.findAll({
    where: { userId },
    include: [
      { model: Objective },
      { model: Phase, include: [Milestone] }
    ]
  });
};

export const getById = async (userId, projectId) => {
  return await Project.findOne({
    where: { id: projectId, userId },
    include: [Objective, Phase, Task]
  });
};

export const update = async (userId, projectId, updates) => {
  const project = await Project.findOne({ where: { id: projectId, userId } });
  if (!project) throw new Error('Project not found');
  return await project.update(updates);
};

export const destroy = async (userId, projectId) => {
  const project = await Project.findOne({ where: { id: projectId, userId } });
  if (!project) throw new Error('Project not found');
  await project.update({ status: 'cancelled' });
};
```

### Routes
`backend/src/routes/projects.js`:
```javascript
import express from 'express';
import * as ProjectService from '../services/project-service.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', async (req, res, next) => {
  try {
    const project = await ProjectService.create(req.user.id, req.body);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const projects = await ProjectService.getAll(req.user.id);
    res.json({ projects });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const project = await ProjectService.getById(req.user.id, req.params.id);
    res.json(project);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const project = await ProjectService.update(req.user.id, req.params.id, req.body);
    res.json(project);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await ProjectService.destroy(req.user.id, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
```

---

## Frontend

### API Client
`frontend/src/services/api.js`:
```javascript
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

export const createProject = async (projectData) => {
  const res = await axios.post(`${API_URL}/projects`, projectData, {
    headers: getAuthHeader()
  });
  return res.data;
};

export const getProjects = async () => {
  const res = await axios.get(`${API_URL}/projects`, {
    headers: getAuthHeader()
  });
  return res.data.projects;
};

export const getProject = async (id) => {
  const res = await axios.get(`${API_URL}/projects/${id}`, {
    headers: getAuthHeader()
  });
  return res.data;
};
```

### Dashboard
`frontend/src/pages/Dashboard.jsx`:
```jsx
import React, { useState, useEffect } from 'react';
import { getProjects } from '../services/api';
import ProjectCard from '../components/ProjectCard';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadProjects();
  }, []);
  
  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Cargando...</div>;
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mis Proyectos</h1>
        <a
          href="/project/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nuevo Proyecto
        </a>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
```

### ProjectCard Component
`frontend/src/components/ProjectCard.jsx`:
```jsx
import React from 'react';

function ProjectCard({ project }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
      <p className="text-gray-600 text-sm mb-4">{project.description}</p>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progreso</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>
      
      <a
        href={`/project/${project.id}`}
        className="text-blue-600 hover:underline text-sm"
      >
        Ver detalles →
      </a>
    </div>
  );
}

export default ProjectCard;
```

---

## Criterios de aceptación
- [ ] Crear proyecto con título, descripción, fecha
- [ ] Listar proyectos del usuario
- [ ] Ver detalle de proyecto
- [ ] Actualizar proyecto
- [ ] Archivar proyecto (soft delete)
- [ ] Solo el owner puede ver/editar sus proyectos
- [ ] Tests backend (80%+ coverage)

**Próximo**: Sprint 3 - Generación de planes con IA