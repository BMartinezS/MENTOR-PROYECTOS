import crypto from 'crypto';
import { revenuecatService } from '../services/revenuecat-service.js';

/**
 * Maneja webhooks de RevenueCat para sincronizar estado de suscripciones
 */
export const handleRevenueCatWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-revenuecat-signature'];
    const payload = req.body;

    // Validar signature de RevenueCat (en producción)
    if (process.env.NODE_ENV === 'production') {
      const isValid = verifyRevenueCatSignature(payload, signature);
      if (!isValid) {
        console.warn('Invalid RevenueCat webhook signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }
    }

    console.log('RevenueCat webhook received:', {
      event_type: payload.event?.type,
      app_user_id: payload.event?.app_user_id,
      timestamp: new Date().toISOString(),
    });

    // Procesar el evento
    await revenuecatService.processWebhookEvent(payload);

    // RevenueCat espera un 200 OK
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing RevenueCat webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Verifica la signature del webhook de RevenueCat
 * @param {object} payload - El payload del webhook
 * @param {string} signature - La signature del header
 * @returns {boolean} - True si la signature es válida
 */
function verifyRevenueCatSignature(payload, signature) {
  if (!signature) return false;

  const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('REVENUECAT_WEBHOOK_SECRET not configured');
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}