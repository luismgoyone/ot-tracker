import 'dotenv/config';
import dataSource from './data-source';
import { seedDatabase } from './seed-data';

/** CLI: `npm run seed` (compiled) or `npm run seed:dev`. Refuses to run in production. */
async function seed() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed sample data into a production database');
  }

  await dataSource.initialize();
  try {
    await seedDatabase(dataSource);
    console.log('Seeded sample data. Log in with e.g. supervisor@company.com / password123');
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
