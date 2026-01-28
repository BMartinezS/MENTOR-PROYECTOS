import * as TaskService from '../services/task-service.js';

export async function getDetails(req, res, next) {
  try {
    const task = await TaskService.getById(req.user.id, req.params.id);
    res.json({ task });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const task = await TaskService.update(req.user, req.params.id, req.body);
    res.json({ task });
  } catch (err) {
    next(err);
  }
}

export async function complete(req, res, next) {
  try {
    const result = await TaskService.complete(req.user.id, req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

