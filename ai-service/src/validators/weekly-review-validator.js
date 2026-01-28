const hasString = (value) => typeof value === 'string' && value.trim().length > 0;

const isNumber = (value) => typeof value === 'number' && !Number.isNaN(value);

export const validateWeeklyReviewInput = (data) => {
  if (!data || typeof data !== 'object') return { ok: false };

  if (!hasString(data.projectTitle)) return { ok: false };

  if (!isNumber(data.tasksCompleted)) return { ok: false };
  if (!isNumber(data.tasksPending)) return { ok: false };
  if (!isNumber(data.blockedTasks)) return { ok: false };
  if (!isNumber(data.hoursSpent)) return { ok: false };
  if (!isNumber(data.targetHours)) return { ok: false };

  return { ok: true };
};

