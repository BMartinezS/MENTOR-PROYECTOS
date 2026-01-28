import { AppError } from '../errors/app-error.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.details?.map((d) => d.message),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, code: err.code });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}

