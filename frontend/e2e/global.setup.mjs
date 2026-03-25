import { startPostgresContainer, waitForPostgresReady } from './support/postgresContainer.mjs';

export default async function globalSetup() {
  if (process.env.PLAYWRIGHT_USE_LOCAL_DB === '1') {
    return;
  }

  await startPostgresContainer();
  await waitForPostgresReady();
}
