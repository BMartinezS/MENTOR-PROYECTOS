import * as ProjectService from '../services/project-service.js';

export async function create(req, res, next) {
  try {
    const project = await ProjectService.create(req.user, req.body);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

export async function createAiPlan(req, res, next) {
  try {
    const result = await ProjectService.createWithAI(req.user, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getAll(req, res, next) {
  try {
    const projects = await ProjectService.getAll(req.user.id);
    res.json({ projects });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const project = await ProjectService.getById(req.user.id, req.params.id);
    res.json(project);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const project = await ProjectService.update(req.user.id, req.params.id, req.body);
    res.json(project);
  } catch (err) {
    next(err);
  }
}

export async function destroy(req, res, next) {
  try {
    await ProjectService.destroy(req.user.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

