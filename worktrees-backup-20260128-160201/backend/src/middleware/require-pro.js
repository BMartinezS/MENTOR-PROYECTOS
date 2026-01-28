import { AppError } from '../errors/app-error.js';

/**
 * Middleware que verifica si el usuario tiene suscripción Pro activa
 * Debe ser usado después del middleware authenticate
 */
export function requireProTier(req, _res, next) {
  // Verificar que el usuario esté autenticado
  if (!req.user) {
    return next(new AppError('Usuario no autenticado', {
      statusCode: 401,
      code: 'not_authenticated'
    }));
  }

  // Verificar tier Pro
  if (req.user.tier !== 'pro') {
    return next(new AppError('Esta función requiere suscripción Pro', {
      statusCode: 403,
      code: 'pro_tier_required',
      details: {
        currentTier: req.user.tier || 'free',
        requiredTier: 'pro',
        upgradeUrl: '/paywall' // Para que el frontend sepa dónde redirigir
      }
    }));
  }

  return next();
}

/**
 * Middleware más flexible que permite tanto Free como Pro,
 * pero limita funcionalidad para usuarios Free
 */
export function requireProOrLimitFree(limits = {}) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Usuario no autenticado', {
        statusCode: 401,
        code: 'not_authenticated'
      }));
    }

    // Agregar información de tier al request para uso posterior
    req.userLimits = {
      tier: req.user.tier || 'free',
      isPro: req.user.tier === 'pro',
      limits: req.user.tier === 'pro' ? {} : limits
    };

    return next();
  };
}
