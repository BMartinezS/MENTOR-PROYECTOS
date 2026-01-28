import { createHash, randomUUID } from 'crypto';

const slugify = (value) =>
  value
    ?.toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') || '';

const sanitizeProjectId = (projectId) => {
  const slug = slugify(projectId);
  if (slug.length > 0) return slug;
  return 'plan';
};

const normalizeKey = (value) => slugify(value) || null;

const buildStableId = (prefix, projectId, seed, index) => {
  const base = slugify(seed) || `${prefix}-${index + 1}`;
  const hash = createHash('sha1').update(`${projectId}-${base}-${index}`).digest('hex').slice(0, 6);
  return `${prefix}-${projectId}-${base}-${hash}`;
};

const createLookup = (items = []) => {
  const map = new Map();
  items.forEach((item) => {
    if (!item) return;
    if (typeof item.id === 'string' && item.id.trim().length > 0) {
      const trimmed = item.id.trim();
      map.set(trimmed, trimmed);
    }
    const nameKey = normalizeKey(item.name || item.title);
    if (nameKey && typeof item.id === 'string') {
      map.set(nameKey, item.id.trim());
    }
  });
  return map;
};

const pickExistingId = (lookup, entity) => {
  if (!lookup) return undefined;
  if (entity.id && lookup.has(entity.id.trim())) {
    return lookup.get(entity.id.trim());
  }
  const nameKey = normalizeKey(entity.name || entity.title);
  if (nameKey && lookup.has(nameKey)) {
    return lookup.get(nameKey);
  }
  return undefined;
};

const ensureEntityId = (prefix, entity, index, { projectId, lookup }) => {
  if (entity.id && typeof entity.id === 'string' && entity.id.trim().length > 0) {
    return entity.id.trim();
  }
  const existing = pickExistingId(lookup, entity);
  if (existing) return existing;
  return buildStableId(prefix, projectId, entity.name || entity.title || randomUUID(), index);
};

const buildPhaseMaps = (phases) => {
  const byName = new Map();
  phases.forEach((phase) => {
    const key = normalizeKey(phase.name);
    if (key) byName.set(key, phase.id);
    if (phase.id) byName.set(phase.id, phase.id);
  });
  return byName;
};

const mapTaskPhase = (task, phaseMap) => {
  const candidates = [task.phaseId, task.phase, task.phaseName, task.relatedPhase];
  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (phaseMap.has(trimmed)) return phaseMap.get(trimmed);
      const normalized = normalizeKey(trimmed);
      if (normalized && phaseMap.has(normalized)) return phaseMap.get(normalized);
    }
  }
  return undefined;
};

export const normalizePlanStructure = (plan, { projectId, projectArea, previousPlan } = {}) => {
  const sanitizedProjectId = sanitizeProjectId(projectId || plan.projectId || plan.id || plan.title);
  const normalizedObjectives = (plan.objectives || [])
    .map((objective) => objective?.toString().trim())
    .filter(Boolean);

  const previousPhasesLookup = createLookup(previousPlan?.phases || []);
  const normalizedPhases = (plan.phases || []).map((phase, index) => {
    const basePhase = {
      name: phase.name?.toString().trim() || `Fase ${index + 1}`,
      description: phase.description?.toString().trim() || '',
      order: typeof phase.order === 'number' ? phase.order : index + 1,
      milestones: Array.isArray(phase.milestones) ? phase.milestones : [],
    };

    const phaseId = ensureEntityId('phase', phase, index, {
      projectId: sanitizedProjectId,
      lookup: previousPhasesLookup,
    });

    const previousPhase = (previousPlan?.phases || []).find(
      (prevPhase) => prevPhase.id === phase.id || normalizeKey(prevPhase.name) === normalizeKey(basePhase.name)
    );
    const milestoneLookup = createLookup(previousPhase?.milestones || []);

    const milestones = basePhase.milestones.map((milestone, milestoneIndex) => ({
      id: ensureEntityId('milestone', milestone, milestoneIndex, {
        projectId: `${sanitizedProjectId}-${phaseId}`,
        lookup: milestoneLookup,
      }),
      title: milestone.title?.toString().trim() || `Hito ${milestoneIndex + 1}`,
      dueDate: milestone.dueDate,
    }));

    return {
      ...basePhase,
      id: phaseId,
      milestones,
    };
  });

  const phaseMap = buildPhaseMaps(normalizedPhases);
  const previousTasksLookup = createLookup(previousPlan?.initialTasks || []);
  const normalizedTasks = (plan.initialTasks || []).map((task, index) => {
    const phaseId = mapTaskPhase(task, phaseMap);
    return {
      id: ensureEntityId('task', task, index, {
        projectId: sanitizedProjectId,
        lookup: previousTasksLookup,
      }),
      title: task.title?.toString().trim() || `Tarea ${index + 1}`,
      description: task.description?.toString().trim() || '',
      estimatedHours:
        typeof task.estimatedHours === 'number' && !Number.isNaN(task.estimatedHours)
          ? task.estimatedHours
          : undefined,
      priority: task.priority || 'medium',
      dueDate: task.dueDate,
      phaseId,
    };
  });

  return {
    title: plan.title?.toString().trim() || 'Proyecto',
    projectArea: projectArea || plan.projectArea || 'general',
    objectives: normalizedObjectives,
    phases: normalizedPhases,
    initialTasks: normalizedTasks,
    generatedAt: new Date().toISOString(),
    projectId: sanitizedProjectId,
  };
};
