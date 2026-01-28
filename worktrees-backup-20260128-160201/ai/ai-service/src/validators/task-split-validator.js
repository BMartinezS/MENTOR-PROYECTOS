const hasString = (value) => typeof value === 'string' && value.trim().length > 0;

export const validateTaskSplitResult = (result) => {
  if (!result || typeof result !== 'object') {
    return { ok: false };
  }

  if (!Array.isArray(result.subtasks) || result.subtasks.length === 0) {
    return { ok: false };
  }

  const valid = result.subtasks.every((subtask) => {
    if (!hasString(subtask?.title) || !hasString(subtask?.description)) return false;
    if (typeof subtask?.estimatedHours !== 'number' || Number.isNaN(subtask.estimatedHours) || subtask.estimatedHours <= 0) {
      return false;
    }
    return true;
  });

  return { ok: valid };
};
