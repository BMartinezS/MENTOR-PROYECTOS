import app from '../src/app.js';
import sequelize, { initDatabase } from '../src/config/database.js';

export async function setupDb() {
  await initDatabase();
}

export async function teardownDb() {
  await sequelize.close();
}

export function getApp() {
  return app;
}

