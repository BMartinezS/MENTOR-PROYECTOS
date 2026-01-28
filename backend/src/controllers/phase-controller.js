import * as PhaseService from '../services/phase-service.js';

export async function update(req, res, next) {
  try {
    const phase = await PhaseService.updatePhase(
      req.user.id,
      req.params.id,
      req.params.phaseId,
      req.body
    );
    res.json({ phase });
  } catch (err) {
    next(err);
  }
}

export async function reorder(req, res, next) {
  try {
    const phases = await PhaseService.reorderPhases(req.user.id, req.params.id, req.body.phases);
    res.json({ phases });
  } catch (err) {
    next(err);
  }
}
