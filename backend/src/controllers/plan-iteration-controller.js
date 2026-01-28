import * as PlanIterationService from '../services/plan-iteration-service.js';

export async function list(req, res, next) {
  try {
    const iterations = await PlanIterationService.list(req.user.id, req.params.projectId);
    res.json({ iterations });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const iteration = await PlanIterationService.create(req.user, req.params.projectId, req.body);
    res.status(201).json({ iteration });
  } catch (err) {
    next(err);
  }
}
