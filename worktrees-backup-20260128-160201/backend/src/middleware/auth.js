import jwt from 'jsonwebtoken';

import { AppError } from '../errors/app-error.js';
import { User } from '../models/index.js';

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      throw new AppError('No token provided', {
        statusCode: 401,
        code: 'no_token',
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.userId);

    if (!user) {
      throw new AppError('Invalid token', { statusCode: 401, code: 'invalid_token' });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return next(
      new AppError('Invalid token', { statusCode: 401, code: 'invalid_token' })
    );
  }
}

