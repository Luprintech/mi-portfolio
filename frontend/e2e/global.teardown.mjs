import { ensurePostgresContainerStopped } from './support/postgresContainer.mjs';

export default async function globalTeardown() {
  if (process.env.PLAYWRIGHT_USE_LOCAL_DB === '1') {
    return;
  }

  await ensurePostgresContainerStopped();
}
