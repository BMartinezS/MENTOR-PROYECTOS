import request from 'supertest';

import { getApp, setupDb, teardownDb } from './helpers.js';
import { User } from '../src/models/index.js';

beforeAll(setupDb);
afterAll(teardownDb);

describe('RevenueCat Webhooks', () => {
  let testUser;

  beforeEach(async () => {
    // Crear usuario de prueba
    testUser = await User.create({
      email: 'test@example.com',
      passwordHash: 'dummy-hash',
      name: 'Test User',
      tier: 'free',
    });
  });

  afterEach(async () => {
    // Limpiar después de cada test
    await User.destroy({ where: {} });
  });

  test('should upgrade user to pro on INITIAL_PURCHASE event', async () => {
    const app = getApp();

    const webhookPayload = {
      event: {
        type: 'INITIAL_PURCHASE',
        app_user_id: testUser.id,
        entitlements: {
          pro: {
            expires_date: null, // Subscription sin expiración
            original_purchase_date: '2023-01-01T00:00:00Z',
            purchase_date: '2023-01-01T00:00:00Z',
            product_identifier: 'mentor_pro_monthly',
          },
        },
      },
    };

    const response = await request(app)
      .post('/api/webhooks/revenuecat')
      .send(webhookPayload)
      .expect(200);

    expect(response.body.received).toBe(true);

    // Verificar que el usuario fue actualizado a Pro
    await testUser.reload();
    expect(testUser.tier).toBe('pro');
  });

  test('should downgrade user to free on EXPIRATION event', async () => {
    // Configurar usuario como Pro primero
    await testUser.update({ tier: 'pro' });

    const app = getApp();

    const webhookPayload = {
      event: {
        type: 'EXPIRATION',
        app_user_id: testUser.id,
        entitlements: {
          // Sin entitlements pro activos
        },
      },
    };

    const response = await request(app)
      .post('/api/webhooks/revenuecat')
      .send(webhookPayload)
      .expect(200);

    expect(response.body.received).toBe(true);

    // Verificar que el usuario fue downgradeado a Free
    await testUser.reload();
    expect(testUser.tier).toBe('free');
  });

  test('should maintain pro on RENEWAL event', async () => {
    const app = getApp();

    const webhookPayload = {
      event: {
        type: 'RENEWAL',
        app_user_id: testUser.id,
        entitlements: {
          pro: {
            expires_date: '2024-01-01T00:00:00Z', // Fecha futura
            original_purchase_date: '2023-01-01T00:00:00Z',
            purchase_date: '2023-12-01T00:00:00Z',
            product_identifier: 'mentor_pro_monthly',
          },
        },
      },
    };

    const response = await request(app)
      .post('/api/webhooks/revenuecat')
      .send(webhookPayload)
      .expect(200);

    expect(response.body.received).toBe(true);

    // Verificar que el usuario sigue como Pro
    await testUser.reload();
    expect(testUser.tier).toBe('pro');
  });

  test('should handle PRODUCT_CHANGE event', async () => {
    const app = getApp();

    const webhookPayload = {
      event: {
        type: 'PRODUCT_CHANGE',
        app_user_id: testUser.id,
        entitlements: {
          pro: {
            expires_date: '2024-01-01T00:00:00Z',
            original_purchase_date: '2023-01-01T00:00:00Z',
            purchase_date: '2023-12-01T00:00:00Z',
            product_identifier: 'mentor_pro_annual', // Cambió a anual
          },
        },
      },
    };

    const response = await request(app)
      .post('/api/webhooks/revenuecat')
      .send(webhookPayload)
      .expect(200);

    expect(response.body.received).toBe(true);

    // Verificar que el usuario sigue como Pro (cambio de producto)
    await testUser.reload();
    expect(testUser.tier).toBe('pro');
  });

  test('should handle missing user gracefully', async () => {
    const app = getApp();

    const webhookPayload = {
      event: {
        type: 'INITIAL_PURCHASE',
        app_user_id: 'non-existent-user-id',
        entitlements: {
          pro: {
            expires_date: null,
            original_purchase_date: '2023-01-01T00:00:00Z',
            purchase_date: '2023-01-01T00:00:00Z',
            product_identifier: 'mentor_pro_monthly',
          },
        },
      },
    };

    const response = await request(app)
      .post('/api/webhooks/revenuecat')
      .send(webhookPayload)
      .expect(200);

    expect(response.body.received).toBe(true);
    // No debería fallar, solo logea warning
  });

  test('should handle malformed payload gracefully', async () => {
    const app = getApp();

    const webhookPayload = {
      // Sin event
      invalid: 'payload',
    };

    const response = await request(app)
      .post('/api/webhooks/revenuecat')
      .send(webhookPayload)
      .expect(200);

    expect(response.body.received).toBe(true);
    // No debería fallar, solo logea warning
  });

  test('should not change tier when entitlement is expired', async () => {
    const app = getApp();

    const webhookPayload = {
      event: {
        type: 'INITIAL_PURCHASE',
        app_user_id: testUser.id,
        entitlements: {
          pro: {
            expires_date: '2022-01-01T00:00:00Z', // Fecha pasada (expirado)
            original_purchase_date: '2021-01-01T00:00:00Z',
            purchase_date: '2021-01-01T00:00:00Z',
            product_identifier: 'mentor_pro_monthly',
          },
        },
      },
    };

    const response = await request(app)
      .post('/api/webhooks/revenuecat')
      .send(webhookPayload)
      .expect(200);

    expect(response.body.received).toBe(true);

    // Verificar que el usuario sigue en free (entitlement expirado)
    await testUser.reload();
    expect(testUser.tier).toBe('free');
  });
});