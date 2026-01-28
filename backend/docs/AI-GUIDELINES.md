# AI Guidelines - Cómo Claude Code debe programar

## Principios generales

1. **Consistencia de estilo**: Seguir las convenciones del código existente
2. **Tests obligatorios**: Todo código debe tener tests unitarios (mínimo 80% coverage)
3. **Documentación**: JSDoc en funciones públicas, comentarios donde la lógica sea compleja
4. **Seguridad first**: Nunca hardcodear credenciales, validar inputs, sanitizar outputs

---

## Stack y herramientas

### Backend
- **Node.js 20+** con ES modules (`type: "module"` en package.json)
- **Express 4.x**
- **Sequelize** para ORM con PostgreSQL
- **Jest** para tests
- **ESLint** + **Prettier** para formato

### Frontend
- **React 18+** con hooks (NO class components)
- **React Router v6**
- **Tailwind CSS** para estilos
- **Axios** para HTTP
- **Vitest** para tests

### AI Service
- **OpenAI SDK oficial** (no llamadas fetch directas)
- **Express** para endpoints internos
- **Rate limiting** con `express-rate-limit`

---

## Convenciones de código

### JavaScript/Node.js

```javascript
// ✅ CORRECTO
const getUserProjects = async (userId) => {
  const projects = await Project.findAll({ 
    where: { userId },
    include: [Phase, Task] 
  });
  return projects;
};

// ❌ INCORRECTO (sin async/await, sin includes)
function getUserProjects(userId) {
  return Project.findAll({ where: { user_id: userId } });
}
```

### Naming
- **Archivos**: kebab-case (`user-controller.js`, `auth-middleware.js`)
- **Funciones**: camelCase (`createProject`, `sendCheckin`)
- **Clases/Componentes**: PascalCase (`UserModel`, `ProjectCard`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_PROJECTS_FREE`, `JWT_SECRET`)

### Estructura de archivos

**Controllers**:
```javascript
// backend/src/controllers/project-controller.js
export const createProject = async (req, res, next) => {
  try {
    const { title, description, targetDate } = req.body;
    const project = await ProjectService.create(req.user.id, { title, description, targetDate });
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};
```

**Services** (lógica de negocio):
```javascript
// backend/src/services/project-service.js
export const create = async (userId, projectData) => {
  // Validaciones
  if (!projectData.title) {
    throw new ValidationError('Title is required');
  }
  
  // Lógica de negocio
  const project = await Project.create({
    userId,
    ...projectData,
    status: 'active',
    progress: 0
  });
  
  return project;
};
```

---

## Error handling

### Backend
```javascript
// Usar middleware global de errores
// backend/src/middleware/error-handler.js
export const errorHandler = (err, req, res, next) => {
  console.error(err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
};
```

### Frontend
```javascript
// Usar try/catch en async functions
const handleCreateProject = async (projectData) => {
  try {
    const project = await api.createProject(projectData);
    navigate(`/project/${project.id}`);
  } catch (error) {
    setError(error.response?.data?.error || 'Error creating project');
  }
};
```

---

## Tests

### Backend (Jest)
```javascript
// backend/tests/services/project-service.test.js
describe('ProjectService.create', () => {
  it('should create project with valid data', async () => {
    const userId = 'test-user-id';
    const projectData = {
      title: 'Test Project',
      description: 'Test description',
      targetDate: '2025-03-01'
    };
    
    const project = await ProjectService.create(userId, projectData);
    
    expect(project.title).toBe('Test Project');
    expect(project.status).toBe('active');
    expect(project.progress).toBe(0);
  });
  
  it('should throw error if title is missing', async () => {
    await expect(
      ProjectService.create('user-id', { description: 'Test' })
    ).rejects.toThrow('Title is required');
  });
});
```

### Frontend (Vitest + React Testing Library)
```javascript
// frontend/src/components/ProjectCard.test.jsx
import { render, screen } from '@testing-library/react';
import ProjectCard from './ProjectCard';

test('renders project title and progress', () => {
  const project = {
    id: '1',
    title: 'My Project',
    progress: 45
  };
  
  render(<ProjectCard project={project} />);
  
  expect(screen.getByText('My Project')).toBeInTheDocument();
  expect(screen.getByText('45%')).toBeInTheDocument();
});
```

---

## Seguridad

### Variables de entorno
```javascript
// ✅ CORRECTO
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET not configured');
}

// ❌ INCORRECTO
const jwtSecret = 'mi-secreto-hardcodeado';
```

### Validación de inputs
```javascript
// ✅ CORRECTO - usar librería de validación
import Joi from 'joi';

const projectSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(5000),
  targetDate: Joi.date().iso().min('now')
});

const { error, value } = projectSchema.validate(req.body);
if (error) {
  return res.status(400).json({ error: error.details[0].message });
}
```

### SQL Injection prevention
```javascript
// ✅ CORRECTO - usar Sequelize con parámetros
const projects = await Project.findAll({
  where: { userId: req.user.id }
});

// ❌ INCORRECTO - raw query sin sanitizar
const projects = await sequelize.query(
  `SELECT * FROM projects WHERE user_id = '${req.user.id}'`
);
```

---

## AI Service - Prompts

### Template de prompts
```javascript
// ai-service/src/prompts/generate-plan.js
export const generatePlanPrompt = (idea, availableHours, targetDate) => {
  return `Eres un mentor de proyectos. Un emprendedor quiere: "${idea}".

Disponibilidad: ${availableHours} horas/semana.
Fecha objetivo: ${targetDate}.

Genera un plan en JSON con esta estructura EXACTA:
{
  "title": "Título claro del proyecto",
  "objectives": ["objetivo 1", "objetivo 2", "objetivo 3"],
  "phases": [
    {
      "name": "Nombre de la fase",
      "description": "Breve descripción",
      "order": 1,
      "milestones": [
        {
          "title": "Hito importante",
          "dueDate": "YYYY-MM-DD"
        }
      ]
    }
  ],
  "initialTasks": [
    {
      "title": "Tarea específica",
      "description": "Qué hacer exactamente",
      "estimatedHours": 2,
      "priority": "high",
      "dueDate": "YYYY-MM-DD"
    }
  ]
}

Reglas:
- 3-5 fases máximo
- 1-3 hitos por fase
- 5-7 tareas iniciales para la primera semana
- Tareas realistas según horas disponibles
- Fechas coherentes con targetDate
- Responde SOLO el JSON, sin texto adicional`;
};
```

### Validación de respuestas de IA
```javascript
// ai-service/src/validators/plan-validator.js
export const validatePlan = (plan) => {
  if (!plan.title || !plan.objectives || !plan.phases) {
    throw new Error('Invalid plan structure');
  }
  
  if (plan.phases.length > 7) {
    throw new Error('Too many phases (max 7)');
  }
  
  if (plan.initialTasks.length < 3 || plan.initialTasks.length > 10) {
    throw new Error('Invalid number of initial tasks (3-10)');
  }
  
  return true;
};
```

---

## Git commits

Formato:
```
<type>: <description>

[optional body]
```

Types:
- `feat`: Nueva feature
- `fix`: Bug fix
- `refactor`: Refactorización
- `test`: Agregar tests
- `docs`: Documentación
- `chore`: Tareas de mantenimiento

Ejemplos:
```
feat: implement user authentication with JWT

- Add login/register endpoints
- Create auth middleware
- Add password hashing with bcrypt
```

```
fix: prevent duplicate project creation

Check if project with same title exists before creating.
```

---

## Performance

### Backend
- Usar índices en queries frecuentes
- Paginar resultados (máximo 50 items por request)
- Cachear respuestas de IA (Redis en futuro)

### Frontend
- Lazy load de componentes: `const Dashboard = lazy(() => import('./Dashboard'))`
- Memoización: `useMemo` para cálculos costosos
- Debounce en búsquedas: `useDebounce(searchTerm, 300)`

---

## Deployment checklist

Antes de deploy, verificar:
- [ ] Tests pasan (npm test)
- [ ] No hay console.log en producción
- [ ] Variables de entorno documentadas en .env.example
- [ ] Migrations de DB probadas
- [ ] Rate limiting configurado
- [ ] CORS correctamente configurado
- [ ] Helmet.js activado