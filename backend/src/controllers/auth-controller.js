import * as AuthService from '../services/auth-service.js';

export async function register(req, res, next) {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await AuthService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function profile(req, res) {
  res.json(req.user);
}

