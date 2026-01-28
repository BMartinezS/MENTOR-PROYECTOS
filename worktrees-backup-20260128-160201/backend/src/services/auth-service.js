import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { AppError } from '../errors/app-error.js';
import { User } from '../models/index.js';

function signToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function register({ email, password, name, timezone }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new AppError('Email already registered', {
      statusCode: 409,
      code: 'email_taken',
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.scope('withPassword').create({
    email,
    passwordHash,
    name,
    timezone,
  });

  const token = signToken(user);
  const safeUser = await User.findByPk(user.id);
  return { user: safeUser, token };
}

export async function login({ email, password }) {
  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user) {
    throw new AppError('Invalid credentials', {
      statusCode: 401,
      code: 'invalid_credentials',
    });
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    throw new AppError('Invalid credentials', {
      statusCode: 401,
      code: 'invalid_credentials',
    });
  }

  const token = signToken(user);
  const safeUser = await User.findByPk(user.id);
  return { user: safeUser, token };
}

