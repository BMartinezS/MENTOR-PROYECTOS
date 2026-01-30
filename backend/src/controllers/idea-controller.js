import * as IdeaService from '../services/idea-service.js';

export async function create(req, res, next) {
  try {
    const idea = await IdeaService.create(req.user.id, req.body);
    res.status(201).json(idea);
  } catch (err) {
    next(err);
  }
}

export async function getAll(req, res, next) {
  try {
    const { status, tags, limit, offset } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];
    if (limit) filters.limit = parseInt(limit, 10);
    if (offset) filters.offset = parseInt(offset, 10);

    const result = await IdeaService.getAll(req.user.id, filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const idea = await IdeaService.getById(req.user.id, req.params.id);
    res.json(idea);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const idea = await IdeaService.update(req.user.id, req.params.id, req.body);
    res.json(idea);
  } catch (err) {
    next(err);
  }
}

export async function destroy(req, res, next) {
  try {
    await IdeaService.destroy(req.user.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function archive(req, res, next) {
  try {
    const idea = await IdeaService.archive(req.user.id, req.params.id);
    res.json(idea);
  } catch (err) {
    next(err);
  }
}

export async function unarchive(req, res, next) {
  try {
    const idea = await IdeaService.unarchive(req.user.id, req.params.id);
    res.json(idea);
  } catch (err) {
    next(err);
  }
}

export async function promoteToProject(req, res, next) {
  try {
    const result = await IdeaService.promoteToProject(req.user, req.params.id);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}
