import { getUserSubscriptionStatus } from '../services/revenuecat-service.js';

/**
 * GET /api/subscription/status
 * Returns the current subscription status for the authenticated user
 */
export const getSubscriptionStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const status = await getUserSubscriptionStatus(userId);

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};
