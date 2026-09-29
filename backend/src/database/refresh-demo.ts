import 'dotenv/config';
import dataSource from './data-source';
import { refreshDemoRecords } from './seed-data';

/**
 * Replaces all OT records with fresh demo data dated relative to today, so the dashboards
 * (last 6 months / 30 days / this month) always have something to show. Users and
 * departments are kept. Run monthly by .github/workflows/refresh-demo-data.yml.
 *
 * This DELETES every OT record, so it only runs when ALLOW_DEMO_REFRESH=true.
 */
async function refresh() {
  if (process.env.ALLOW_DEMO_REFRESH !== 'true') {
    throw new Error('Refusing to replace OT records: set ALLOW_DEMO_REFRESH=true to confirm this is a demo database');
  }

  await dataSource.initialize();
  try {
    // One transaction: if anything fails, the old records stay.
    const { records } = await dataSource.transaction((manager) => refreshDemoRecords(manager));
    console.log(`Demo data refreshed: ${records} OT records dated relative to today.`);
  } finally {
    await dataSource.destroy();
  }
}

refresh().catch((error) => {
  console.error(error);
  process.exit(1);
});
