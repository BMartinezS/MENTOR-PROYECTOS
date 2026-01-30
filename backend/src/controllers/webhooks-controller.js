import crypto from 'crypto';
import { processWebhookEvent } from '../services/revenuecat-service.js';

/**
 * Maneja webhooks de RevenueCat para sincronizar estado de suscripciones
 */
export const handleRevenueCatWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-revenuecat-signature'];
    // When using express.raw(), req.body is a Buffer
    const rawBody = Buffer.isBuffer(req.body) ? req.body : null;
    const payload = rawBody ? JSON.parse(rawBody.toString()) : req.body;

    // Always validate signature when webhook secret is configured
    const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
    if (webhookSecret) {
      const isValid = verifyRevenueCatSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.warn('Invalid RevenueCat webhook signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }
    } else {
      console.warn('REVENUECAT_WEBHOOK_SECRET not configured - skipping signature validation');
    }

    console.log('RevenueCat webhook received:', {
      event_type: payload.event?.type,
      app_user_id: payload.event?.app_user_id,
      timestamp: new Date().toISOString(),
    });

    // Procesar el evento
    await processWebhookEvent(payload);

    // RevenueCat espera un 200 OK
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing RevenueCat webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Verifica la signature del webhook de RevenueCat
 * @param {Buffer|null} rawBody - The raw request body bytes
 * @param {string} signature - La signature del header
 * @param {string} webhookSecret - The webhook secret from environment
 * @returns {boolean} - True si la signature es válida
 */
function verifyRevenueCatSignature(rawBody, signature, webhookSecret) {
  if (!signature || !rawBody) return false;

  try {
    // Use raw bytes for HMAC to ensure signature matches exactly
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
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