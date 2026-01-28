import 'dotenv/config';

import sequelize from '../config/database.js';

try {
  await sequelize.authenticate();
  // eslint-disable-next-line no-console
  console.log('DB connection: OK');
  // eslint-disable-next-line no-console
  console.log(`Dialect: ${sequelize.getDialect()}`);
  await sequelize.close();
  process.exit(0);
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('DB connection: FAIL');
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
}
