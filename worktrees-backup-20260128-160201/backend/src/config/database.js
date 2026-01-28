import { Sequelize } from 'sequelize';

const databaseUrl =
  process.env.DATABASE_URL ||
  (process.env.NODE_ENV === 'test' ? 'sqlite::memory:' : null);

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const dialect = databaseUrl.startsWith('sqlite:') ? 'sqlite' : 'postgres';

const sequelize = new Sequelize(databaseUrl, {
  dialect,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions:
    dialect === 'postgres' && process.env.DATABASE_SSL === 'true'
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : undefined,
});

export async function initDatabase() {
  await sequelize.authenticate();

  const shouldSync =
    process.env.DB_SYNC === 'true' || process.env.NODE_ENV === 'test';

  if (shouldSync) {
    await sequelize.sync({ force: process.env.NODE_ENV === 'test' });
  }
}

export default sequelize;

