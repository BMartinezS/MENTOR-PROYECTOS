import * as CheckinService from '../services/checkin-service.js';

export async function getPending(req, res, next) {
  try {
    const checkins = await CheckinService.getPending(req.user.id);
    res.json({ checkins });
  } catch (err) {
    next(err);
  }
}

export async function respond(req, res, next) {
  try {
    const checkin = await CheckinService.respond(req.params.id, req.user.id, req.body);
    res.json({ checkin });
  } catch (err) {
    next(err);
  }
}

