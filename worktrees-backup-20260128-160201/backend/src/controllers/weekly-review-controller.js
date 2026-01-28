import * as WeeklyReviewService from '../services/weekly-review-service.js';

export async function getLatest(req, res, next) {
  try {
    const review = await WeeklyReviewService.getLatestForProject(req.user.id, req.params.projectId);
    res.json({ review });
  } catch (err) {
    next(err);
  }
}

export async function saveAnswers(req, res, next) {
  try {
    const review = await WeeklyReviewService.saveAnswers(
      req.params.id,
      req.user.id,
      req.body.answers
    );
    res.json({ review });
  } catch (err) {
    next(err);
  }
}
