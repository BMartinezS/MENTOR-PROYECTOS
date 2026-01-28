const hasString = (value) => typeof value === 'string' && value.trim().length > 0;

export const validateCheckinContext = (context) => {
  if (!context || typeof context !== 'object') return { ok: false };

  if (!hasString(context.userName)) return { ok: false };
  if (!hasString(context.projectTitle)) return { ok: false };
  if (!hasString(context.nextTask)) return { ok: false };

  if (typeof context.daysSinceProgress !== 'number' || Number.isNaN(context.daysSinceProgress)) {
    return { ok: false };
  }

  const tone = context.tone || 'normal';
  if (!['normal', 'suave', 'directo'].includes(tone)) return { ok: false };

  return { ok: true };
};

