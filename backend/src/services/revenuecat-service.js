import { AppError } from '../errors/app-error.js';
import { User } from '../models/index.js';

// Eventos de RevenueCat que nos interesan
const SUBSCRIPTION_EVENTS = {
  INITIAL_PURCHASE: 'INITIAL_PURCHASE',
  RENEWAL: 'RENEWAL',
  PRODUCT_CHANGE: 'PRODUCT_CHANGE',
  CANCELLATION: 'CANCELLATION',
  BILLING_ISSUE: 'BILLING_ISSUE',
  SUBSCRIBER_ALIAS: 'SUBSCRIBER_ALIAS',
  SUBSCRIPTION_PAUSED: 'SUBSCRIPTION_PAUSED',
  SUBSCRIPTION_EXTENDED: 'SUBSCRIPTION_EXTENDED',
  EXPIRATION: 'EXPIRATION',
  UNCANCELLATION: 'UNCANCELLATION',
};

// Products IDs configurados en RevenueCat
const PRO_PRODUCT_IDS = [
  'mentor_pro_monthly',
  'mentor_pro_annual',
];

/**
 * Procesa eventos del webhook de RevenueCat
 * @param {object} webhookPayload - Payload del webhook
 */
export async function processWebhookEvent(webhookPayload) {
  const { event } = webhookPayload;

  if (!event) {
    console.warn('RevenueCat webhook missing event data');
    return;
  }

  const { type, app_user_id: appUserId, subscriber_attributes, entitlements } = event;

  // Validar que tenemos un user ID
  if (!appUserId) {
    console.warn('RevenueCat webhook missing app_user_id');
    return;
  }

  console.log(`Processing RevenueCat event: ${type} for user ${appUserId}`);

  // Buscar usuario en la base de datos
  const user = await User.findByPk(appUserId);
  if (!user) {
    console.warn(`User not found for app_user_id: ${appUserId}`);
    return;
  }

  // Procesar según el tipo de evento
  switch (type) {
    case SUBSCRIPTION_EVENTS.INITIAL_PURCHASE:
    case SUBSCRIPTION_EVENTS.RENEWAL:
    case SUBSCRIPTION_EVENTS.UNCANCELLATION:
    case SUBSCRIPTION_EVENTS.SUBSCRIPTION_EXTENDED:
      await handleSubscriptionActivated(user, event);
      break;

    case SUBSCRIPTION_EVENTS.EXPIRATION:
    case SUBSCRIPTION_EVENTS.CANCELLATION:
      await handleSubscriptionDeactivated(user, event);
      break;

    case SUBSCRIPTION_EVENTS.PRODUCT_CHANGE:
      await handleProductChange(user, event);
      break;

    case SUBSCRIPTION_EVENTS.BILLING_ISSUE:
    case SUBSCRIPTION_EVENTS.SUBSCRIPTION_PAUSED:
      await handleSubscriptionIssue(user, event);
      break;

    case SUBSCRIPTION_EVENTS.SUBSCRIBER_ALIAS:
      await handleSubscriberAlias(user, event);
      break;

    default:
      console.log(`Unhandled RevenueCat event type: ${type}`);
  }
}

/**
 * Activa suscripción Pro del usuario
 */
async function handleSubscriptionActivated(user, event) {
  try {
    const hasProEntitlement = checkHasProEntitlement(event.entitlements);

    if (hasProEntitlement) {
      await user.update({
        tier: 'pro',
      });

      console.log(`User ${user.id} upgraded to Pro tier`);

      // TODO: Enviar notificación de bienvenida Pro
      // TODO: Sincronizar con analytics (Mixpanel, etc.)
    }
  } catch (error) {
    console.error(`Error activating subscription for user ${user.id}:`, error);
    throw new AppError('Failed to activate subscription', {
      statusCode: 500,
      code: 'subscription_activation_failed',
    });
  }
}

/**
 * Desactiva suscripción Pro del usuario
 */
async function handleSubscriptionDeactivated(user, event) {
  try {
    const hasProEntitlement = checkHasProEntitlement(event.entitlements);

    // Solo degradar si realmente no tiene entitlements Pro activos
    if (!hasProEntitlement) {
      await user.update({
        tier: 'free',
      });

      console.log(`User ${user.id} downgraded to Free tier`);

      // TODO: Enviar notificación de downgrade
      // TODO: Limpiar datos Pro si es necesario
    }
  } catch (error) {
    console.error(`Error deactivating subscription for user ${user.id}:`, error);
    throw new AppError('Failed to deactivate subscription', {
      statusCode: 500,
      code: 'subscription_deactivation_failed',
    });
  }
}

/**
 * Maneja cambio de producto (ej: mensual a anual)
 */
async function handleProductChange(user, event) {
  try {
    const hasProEntitlement = checkHasProEntitlement(event.entitlements);

    await user.update({
      tier: hasProEntitlement ? 'pro' : 'free',
    });

    console.log(`User ${user.id} changed product, tier: ${hasProEntitlement ? 'pro' : 'free'}`);
  } catch (error) {
    console.error(`Error handling product change for user ${user.id}:`, error);
    throw new AppError('Failed to handle product change', {
      statusCode: 500,
      code: 'product_change_failed',
    });
  }
}

/**
 * Maneja problemas de facturación (grace period)
 */
async function handleSubscriptionIssue(user, event) {
  try {
    // En grace period, mantener Pro temporalmente
    // RevenueCat maneja el grace period automáticamente
    console.log(`User ${user.id} has subscription issue: ${event.type}`);

    // TODO: Enviar notificación de problema de pago
    // TODO: Implementar lógica de grace period si es necesario
  } catch (error) {
    console.error(`Error handling subscription issue for user ${user.id}:`, error);
  }
}

/**
 * Maneja alias de subscriber (cambio de user ID)
 */
async function handleSubscriberAlias(user, event) {
  try {
    console.log(`Subscriber alias created for user ${user.id}`);
    // RevenueCat maneja esto automáticamente
    // Solo logeamos para auditoría
  } catch (error) {
    console.error(`Error handling subscriber alias for user ${user.id}:`, error);
  }
}

/**
 * Verifica si el usuario tiene entitlement Pro activo
 * @param {object} entitlements - Entitlements de RevenueCat
 * @returns {boolean} - True si tiene Pro activo
 */
function checkHasProEntitlement(entitlements) {
  if (!entitlements || !entitlements.pro) {
    return false;
  }

  const proEntitlement = entitlements.pro;

  // Verificar que esté activo y no expirado
  const isActive = proEntitlement.expires_date === null ||
    new Date(proEntitlement.expires_date) > new Date();

  return isActive;
}

/**
 * Obtiene el estado de suscripción de un usuario desde RevenueCat
 * @param {string} userId - ID del usuario
 * @returns {object} - Estado de suscripción
 */
export async function getUserSubscriptionStatus(userId) {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', {
        statusCode: 404,
        code: 'user_not_found',
      });
    }

    // Para ahora, retornar el tier desde la DB
    // En el futuro podrías consultar RevenueCat directamente
    return {
      userId: user.id,
      tier: user.tier,
      isActive: user.tier === 'pro',
      // TODO: Agregar fecha de expiración, producto, etc.
    };
  } catch (error) {
    console.error(`Error getting subscription status for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Fuerza una sincronización manual del estado de suscripción
 * Útil para debugging o casos edge
 */
export async function forceSubscriptionSync(userId, revenuecatData) {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', {
        statusCode: 404,
        code: 'user_not_found',
      });
    }

    const hasProEntitlement = checkHasProEntitlement(revenuecatData.entitlements);

    await user.update({
      tier: hasProEntitlement ? 'pro' : 'free',
    });

    console.log(`Manual sync completed for user ${userId}, tier: ${hasProEntitlement ? 'pro' : 'free'}`);

    return {
      userId: user.id,
      tier: user.tier,
      syncedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error in forced sync for user ${userId}:`, error);
    throw error;
  }
}