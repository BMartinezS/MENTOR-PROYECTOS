export const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);

  if (res.headersSent) return next(err);

  const isDev = process.env.NODE_ENV === 'development';
  res.status(500).json({
    error: 'AI service error',
    ...(isDev ? { details: err.message } : {}),
  });
};

