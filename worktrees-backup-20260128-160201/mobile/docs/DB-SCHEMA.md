# Database Schema

PostgreSQL 15+

## users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  timezone VARCHAR(50) DEFAULT 'America/Santiago',
  tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

**preferences** (JSONB):
```json
{
  "mentorTone": "normal",
  "checkinFrequency": "weekly",
  "preferredDays": ["monday", "thursday"],
  "notificationsEnabled": true
}
```

---

## projects

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  target_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
```

---

## objectives

```sql
CREATE TABLE objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_objectives_project_id ON objectives(project_id);
```

---

## phases

```sql
CREATE TABLE phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_phases_project_id ON phases(project_id);
```

---

## milestones

```sql
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_milestones_phase_id ON milestones(phase_id);
CREATE INDEX idx_milestones_due_date ON milestones(due_date);
```

---

## tasks

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES phases(id) ON DELETE SET NULL,
  milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  estimated_hours DECIMAL(5,2),
  due_date DATE,
  completed_at TIMESTAMP,
  blocked_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

---

## checkins

```sql
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('daily', 'weekly', 'blocking')),
  message TEXT NOT NULL,
  responded_at TIMESTAMP,
  response JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_checkins_user_id ON checkins(user_id);
CREATE INDEX idx_checkins_project_id ON checkins(project_id);
CREATE INDEX idx_checkins_responded_at ON checkins(responded_at);
```

**response** (JSONB):
```json
{
  "completed": true,
  "notes": "Sí, lo hice esta mañana",
  "blockedReason": null,
  "nextSteps": "Grabar segunda lección"
}
```

---

## progress_logs

```sql
CREATE TABLE progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT,
  evidence_type VARCHAR(20) CHECK (evidence_type IN ('text', 'link', 'file', 'image')),
  evidence_content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_progress_logs_task_id ON progress_logs(task_id);
CREATE INDEX idx_progress_logs_user_id ON progress_logs(user_id);
```

---

## weekly_reviews

```sql
CREATE TABLE weekly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  summary TEXT,
  questions JSONB,
  suggestions JSONB,
  user_answers JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_weekly_reviews_project_id ON weekly_reviews(project_id);
CREATE INDEX idx_weekly_reviews_week_start ON weekly_reviews(week_start_date);
```

**questions/suggestions** (JSONB):
```json
{
  "questions": [
    "¿Te sentiste abrumado esta semana?",
    "¿El plan fue realista?"
  ],
  "suggestions": [
    "Dividir 'Grabar 5 lecciones' en tareas más pequeñas"
  ]
}
```

---

## ai_usage_logs

```sql
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  operation VARCHAR(50) NOT NULL,
  tokens_used INTEGER NOT NULL,
  cost_usd DECIMAL(10,6),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_user_id ON ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_created_at ON ai_usage_logs(created_at);
```

Usado para monitorear costos de IA por usuario.

---

## Relaciones principales

```
users (1) ──── (N) projects
projects (1) ──── (N) objectives
projects (1) ──── (N) phases
phases (1) ──── (N) milestones
projects (1) ──── (N) tasks
tasks (1) ──── (N) progress_logs
projects (1) ──── (N) checkins
projects (1) ──── (N) weekly_reviews
```

---

## Queries comunes

### Obtener proyecto completo con todas sus relaciones
```sql
SELECT 
  p.*,
  json_agg(DISTINCT o.*) as objectives,
  json_agg(DISTINCT ph.*) as phases
FROM projects p
LEFT JOIN objectives o ON o.project_id = p.id
LEFT JOIN phases ph ON ph.project_id = p.id
WHERE p.id = $1
GROUP BY p.id;
```

### Calcular progreso de proyecto
```sql
SELECT 
  p.id,
  COUNT(t.id) as total_tasks,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
  ROUND(
    (COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(t.id), 0)) * 100
  ) as progress_percentage
FROM projects p
LEFT JOIN tasks t ON t.project_id = p.id
WHERE p.id = $1
GROUP BY p.id;
```

### Obtener check-ins pendientes de un usuario
```sql
SELECT c.*, p.title as project_title
FROM checkins c
JOIN projects p ON p.id = c.project_id
WHERE c.user_id = $1 
  AND c.responded_at IS NULL
ORDER BY c.created_at ASC;
```

### Tareas de la semana actual
```sql
SELECT *
FROM tasks
WHERE project_id = $1
  AND due_date >= date_trunc('week', CURRENT_DATE)
  AND due_date < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
ORDER BY due_date, priority DESC;
```