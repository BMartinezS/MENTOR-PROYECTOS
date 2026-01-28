import rateLimit from 'express-rate-limit';

const getClientKey = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
};

export const applyRateLimit = () => {
  const maxPerHour = Number(process.env.RATE_LIMIT_PER_HOUR || 100);
  return rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: Number.isNaN(maxPerHour) || maxPerHour <= 0 ? 100 : maxPerHour,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientKey,
    handler: (req, res) => {
      res.status(429).json({ error: 'Rate limit exceeded' });
    },
  });
};
