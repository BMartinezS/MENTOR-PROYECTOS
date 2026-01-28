import express from 'express';
import { handleRevenueCatWebhook } from '../controllers/webhooks-controller.js';

const router = express.Router();

/**
 * POST /webhooks/revenuecat
 * Maneja eventos de RevenueCat para sincronizar estado de suscripciones
 *
 * Este endpoint es llamado por RevenueCat cuando:
 * - Un usuario compra una suscripción
 * - Una suscripción se renueva
 * - Una suscripción se cancela
 * - Una suscripción expira
 * - Hay problemas de facturación
 *
 * No requiere autenticación JWT ya que viene de RevenueCat
 * pero se valida la signature del webhook
 */
router.post('/revenuecat', handleRevenueCatWebhook);

export default router;