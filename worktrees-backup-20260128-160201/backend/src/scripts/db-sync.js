import 'dotenv/config';

import sequelize, { initDatabase } from '../config/database.js';

try {
  await initDatabase();
  // eslint-disable-next-line no-console
  console.log('Database sync completed');
  await sequelize.close();
  process.exit(0);
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('Database sync failed');
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
}
