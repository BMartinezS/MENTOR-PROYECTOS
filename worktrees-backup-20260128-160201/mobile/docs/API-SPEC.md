# API Specification

Base URL (dev): `http://localhost:3000/api`

## Authentication

### POST /auth/register
Crea nuevo usuario.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepass123",
  "name": "Juan Pérez",
  "timezone": "America/Santiago"
}
```

**Response 201**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Juan Pérez"
  },
  "token": "jwt-token"
}
```

---

### POST /auth/login

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response 200**:
```json
{
  "user": { "id": "uuid", "email": "...", "name": "..." },
  "token": "jwt-token"
}
```

---

### GET /auth/profile
Requiere header: `Authorization: Bearer {token}`

**Response 200**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Juan Pérez",
  "timezone": "America/Santiago",
  "tier": "free",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

---

## Projects

### POST /projects
Crea proyecto manualmente (sin IA).

**Request**:
```json
{
  "title": "Lanzar curso online",
  "description": "Curso de JavaScript para principiantes",
  "targetDate": "2025-04-01"
}
```

**Response 201**:
```json
{
  "id": "uuid",
  "title": "Lanzar curso online",
  "status": "active",
  "progress": 0,
  "createdAt": "2025-01-16T..."
}
```

---

### POST /projects/ai-plan
Crea proyecto con generación de plan por IA.

**Request**:
```json
{
  "idea": "Quiero lanzar un curso online de JavaScript en 2 meses",
  "availableHoursPerWeek": 10,
  "targetDate": "2025-03-16"
}
```

**Response 201**:
```json
{
  "project": {
    "id": "uuid",
    "title": "Curso online de JavaScript",
    "description": "...",
    "targetDate": "2025-03-16"
  },
  "plan": {
    "objectives": [
      "Crear contenido de 20 lecciones",
      "Configurar plataforma de hosting",
      "Lanzar con 50 estudiantes"
    ],
    "phases": [
      {
        "id": "uuid",
        "name": "Diseño y planificación",
        "order": 1,
        "milestones": [
          {
            "id": "uuid",
            "title": "Currículum definido",
            "dueDate": "2025-01-25"
          }
        ]
      }
    ],
    "initialTasks": [
      {
        "id": "uuid",
        "title": "Definir temas del curso",
        "description": "Listar 20 temas principales",
        "estimatedHours": 2,
        "dueDate": "2025-01-18"
      }
    ]
  }
}
```

---

### GET /projects
Lista proyectos del usuario.

**Response 200**:
```json
{
  "projects": [
    {
      "id": "uuid",
      "title": "Lanzar curso online",
      "status": "active",
      "progress": 35,
      "nextMilestone": {
        "title": "Primera lección grabada",
        "dueDate": "2025-01-20"
      }
    }
  ]
}
```

---

### GET /projects/:id
Detalle completo de proyecto.

**Response 200**:
```json
{
  "id": "uuid",
  "title": "Lanzar curso online",
  "description": "...",
  "status": "active",
  "progress": 35,
  "targetDate": "2025-04-01",
  "objectives": ["..."],
  "phases": [
    {
      "id": "uuid",
      "name": "Diseño",
      "milestones": [...],
      "tasks": [...]
    }
  ]
}
```

---

### PATCH /projects/:id
Actualiza proyecto.

**Request**:
```json
{
  "title": "Curso JS avanzado",
  "status": "paused"
}
```

---

### DELETE /projects/:id
Archiva proyecto.

**Response 204**

---

## Tasks

### PATCH /tasks/:id/complete
Marca tarea como completada.

**Request**:
```json
{
  "notes": "Terminé de definir los 20 temas principales",
  "evidenceUrl": "https://notion.so/my-curriculum"
}
```

**Response 200**:
```json
{
  "task": {
    "id": "uuid",
    "status": "completed",
    "completedAt": "2025-01-16T..."
  },
  "progressLog": {
    "id": "uuid",
    "notes": "...",
    "evidenceUrl": "..."
  }
}
```

---

## Check-ins

### GET /checkins/pending
Obtiene check-ins pendientes de respuesta.

**Response 200**:
```json
{
  "checkins": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "type": "daily",
      "message": "Hoy tu foco es: Definir temas del curso. ¿Lo vas a hacer?",
      "createdAt": "2025-01-16T08:00:00Z"
    }
  ]
}
```

---

### POST /checkins/:id/respond
Responde a un check-in.

**Request**:
```json
{
  "completed": true,
  "notes": "Sí, lo hice en la mañana. Definí 15 temas.",
  "blockedReason": null
}
```

**Response 200**:
```json
{
  "checkin": {
    "id": "uuid",
    "respondedAt": "2025-01-16T18:30:00Z",
    "response": {
      "completed": true,
      "notes": "..."
    }
  }
}
```

---

## AI Service (interno, no expuesto a frontend)

### POST /ai/generate-plan

**Request**:
```json
{
  "idea": "Quiero lanzar un curso online de JavaScript en 2 meses",
  "availableHoursPerWeek": 10,
  "targetDate": "2025-03-16"
}
```

**Response 200**:
```json
{
  "title": "Curso online de JavaScript",
  "objectives": ["..."],
  "phases": [...],
  "initialTasks": [...]
}
```

---

### POST /ai/generate-checkin

**Request**:
```json
{
  "projectId": "uuid",
  "userId": "uuid",
  "context": {
    "lastCompletedTask": "Definir temas",
    "nextTask": "Grabar primera lección",
    "daysSinceLastProgress": 2
  }
}
```

**Response 200**:
```json
{
  "message": "Bastián, hace 2 días completaste 'Definir temas'. Tu próximo paso es grabar la primera lección. ¿Lo harás hoy?"
}
```

---

### POST /ai/weekly-review

**Request**:
```json
{
  "projectId": "uuid",
  "weekData": {
    "tasksCompleted": 5,
    "tasksPending": 3,
    "hoursSpent": 8,
    "blockedTasks": 1
  }
}
```

**Response 200**:
```json
{
  "summary": "Esta semana completaste 5 de 8 tareas. Dedicaste 8 horas, cumpliendo tu meta de 10h.",
  "questions": [
    "¿Te sentiste abrumado esta semana?",
    "¿La tarea bloqueada necesita ayuda externa?"
  ],
  "suggestions": [
    "Considera dividir 'Grabar 5 lecciones' en tareas más pequeñas"
  ]
}
```