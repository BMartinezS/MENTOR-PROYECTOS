const DEFAULT_DEV_ORIGINS = [
  'http://localhost:19006',
  'http://localhost:8081',
  'http://localhost:3000',
];

export function getCorsOptions() {
  const configured = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  const allowedOrigins = configured.length
    ? configured
    : process.env.NODE_ENV === 'development'
      ? DEFAULT_DEV_ORIGINS
      : [];

  return {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
  };
}

