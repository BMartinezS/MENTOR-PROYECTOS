# Features Pendientes - Estado Actual

**Fecha**: 2025-01-30
**Última actualización**: 2025-01-30

## Estado por Módulo

### 1. PROYECTOS Y TAREAS
| Feature | Backend | Mobile | Estado |
|---------|---------|--------|--------|
| Ver tareas del proyecto | ✅ | ✅ | Funciona |
| Agregar tarea manual | ✅ | ✅ | **COMPLETADO** |
| Editar tarea | ✅ | ✅ | **COMPLETADO** |
| Eliminar tarea | ✅ | ✅ | **COMPLETADO** |
| Marcar tarea completada | ✅ | ✅ | **COMPLETADO** |
| Reordenar tareas (drag) | ❌ | ❌ | Futuro |

### 2. IDEAS (BACKLOG)
| Feature | Backend | Mobile | Estado |
|---------|---------|--------|--------|
| Crear idea | ✅ | ✅ | Funciona |
| Listar ideas activas | ✅ | ✅ | Funciona |
| Editar idea | ✅ | ✅ | Funciona |
| Eliminar idea | ✅ | ✅ | Funciona |
| Archivar idea | ✅ | ✅ | Funciona |
| Ver ideas archivadas | ✅ | ✅ | **COMPLETADO** |
| Promover a proyecto | ✅ | ✅ | Funciona |
| Adjuntos (imágenes, PDFs) | ❌ | ❌ | **FALTA TODO** |
| Chat IA por idea | ✅ | ✅ | **COMPLETADO (PRO only)** |
| Voting/Prioridad | ✅ | ✅ | **COMPLETADO** |
| Tags | ✅ | ✅ | Funciona |
| Límite 5 ideas FREE | ✅ | ✅ | **COMPLETADO** |

### 3. GAMIFICACIÓN
| Feature | Backend | Mobile | Estado |
|---------|---------|--------|--------|
| Streaks | ✅ | ✅ | Funciona |
| XP | ✅ | ✅ | Funciona |
| Badges | ✅ | ✅ | **COMPLETADO** |
| Levels | ✅ | ✅ | **COMPLETADO** |
| Leaderboard | ✅ | ❌ | **FALTA UI** |

### 4. RETOS/CHALLENGES
| Feature | Backend | Mobile | Estado |
|---------|---------|--------|--------|
| 30-Day Challenge | ❌ | ❌ | **FALTA TODO** |
| Weekly Challenges | ❌ | ❌ | **FALTA TODO** |

### 5. MODO PRO ✅ ACTUALIZADO
| Feature | FREE | PRO |
|---------|------|-----|
| Proyectos | 1 | Ilimitados |
| Ideas | 5 | Ilimitadas |
| Iteraciones IA/proyecto | 2 | Ilimitadas |
| Editar tareas | ✅ | ✅ |
| Adjuntos en ideas | ❌ | ✅ (pendiente) |
| Chat IA por idea | ❌ | ✅ |
| Badges/Achievements | Básicos | Todos |
| Challenges | ❌ | ✅ (pendiente) |
| Analytics avanzados | ❌ | ✅ (pendiente) |
| Themes personalizados | ❌ | ✅ (pendiente) |

---

## Resumen de Sprints

### SPRINT A: Completar Proyectos/Tareas ✅ COMPLETADO
1. ✅ UI para agregar tarea manual
2. ✅ UI para editar tarea
3. ✅ UI para eliminar tarea
4. ✅ UI para marcar tarea completada
5. ✅ Actualizar pantalla de proyecto

### SPRINT B: Completar Ideas ✅ COMPLETADO
1. ✅ Filtro para ver archivadas
2. ✅ UI de prioridad/voting
3. ❌ Backend para adjuntos (S3/local) - Pendiente
4. ❌ UI para adjuntos - Pendiente
5. ✅ Backend chat IA por idea
6. ✅ UI chat IA por idea

### SPRINT C: Completar Gamificación ✅ COMPLETADO (parcial)
1. ✅ UI de badges en perfil
2. ✅ Sistema de levels (calcular desde XP)
3. ❌ UI de leaderboard - Pendiente

### SPRINT D: Challenges - PENDIENTE
1. ❌ Modelo Challenge en backend
2. ❌ Weekly challenges
3. ❌ 30-day challenge mode

### SPRINT E: Actualizar PRO ✅ COMPLETADO
1. ✅ Actualizar límites en backend (ideas: 5, iteraciones: 2)
2. ✅ Actualizar paywall UI
3. ✅ Bloquear features PRO en UI (hook useProFeature)
4. ✅ Chat IA bloqueado para FREE
