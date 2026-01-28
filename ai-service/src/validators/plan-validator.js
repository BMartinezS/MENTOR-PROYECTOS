const hasString = (value) => typeof value === 'string' && value.trim().length > 0;
const isPositiveNumber = (value) => typeof value === 'number' && !Number.isNaN(value) && value > 0;

const withinRange = (arr, min, max) => Array.isArray(arr) && arr.length >= min && arr.length <= max;

const validateMilestone = (milestone) => hasString(milestone?.title) && hasString(milestone?.dueDate);

const validatePhase = (phase) =>
  hasString(phase?.name) &&
  hasString(phase?.description) &&
  typeof phase?.order === 'number' &&
  Array.isArray(phase?.milestones) &&
  phase.milestones.length >= 1 &&
  phase.milestones.length <= 3 &&
  phase.milestones.every((milestone) => validateMilestone(milestone));

const validateTask = (task, { availableHours } = {}) => {
  if (!hasString(task?.title) || !hasString(task?.description)) return false;
  if (!isPositiveNumber(task?.estimatedHours)) return false;
  if (availableHours && task.estimatedHours > availableHours) return false;
  if (!['high', 'medium', 'low'].includes((task?.priority || '').toLowerCase())) return false;
  return true;
};

export const validateGeneratedPlan = (plan, { availableHours } = {}) => {
  const errors = [];
  if (!plan || typeof plan !== 'object') {
    errors.push('Plan is required');
    return { ok: false, errors };
  }

  if (!hasString(plan.title)) errors.push('Title is required');
  if (!withinRange(plan.objectives, 1, 5) || !plan.objectives.every((obj) => hasString(obj))) {
    errors.push('Objectives must include 1-5 text items');
  }

  if (!withinRange(plan.phases, 3, 5) || !plan.phases.every((phase) => validatePhase(phase))) {
    errors.push('Phases must include 3-5 items with milestones');
  }

  if (!withinRange(plan.initialTasks, 5, 8) || !plan.initialTasks.every((task) => validateTask(task, { availableHours }))) {
    errors.push('Initial tasks must include 5-8 actionable tasks within capacity');
  }

  return { ok: errors.length === 0, errors };
};
