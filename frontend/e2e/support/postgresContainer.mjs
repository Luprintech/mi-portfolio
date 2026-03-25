import { spawn } from 'child_process';

export const POSTGRES_IMAGE = 'postgres:16-alpine';
export const POSTGRES_CONTAINER_NAME = 'mi-web-e2e-postgres';
export const POSTGRES_DB = 'portfolio_cms_e2e';
export const POSTGRES_USER = 'portfolio';
export const POSTGRES_PASSWORD = 'portfolio';
export const POSTGRES_PORT = 55432;

function runDocker(args, { allowFailure = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', chunk => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', code => {
      if (code === 0 || allowFailure) {
        resolve({ code, stdout, stderr });
        return;
      }

      reject(new Error(stderr.trim() || stdout.trim() || `docker ${args.join(' ')} failed with code ${code}`));
    });
  });
}

async function sleep(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

export async function ensurePostgresContainerStopped() {
  await runDocker(['rm', '-f', POSTGRES_CONTAINER_NAME], { allowFailure: true });
}

export async function startPostgresContainer() {
  await ensurePostgresContainerStopped();

  try {
    await runDocker([
      'run',
      '--detach',
      '--rm',
      '--name', POSTGRES_CONTAINER_NAME,
      '--publish', `${POSTGRES_PORT}:5432`,
      '--env', `POSTGRES_DB=${POSTGRES_DB}`,
      '--env', `POSTGRES_USER=${POSTGRES_USER}`,
      '--env', `POSTGRES_PASSWORD=${POSTGRES_PASSWORD}`,
      POSTGRES_IMAGE,
    ]);
  } catch (error) {
    throw new Error(`No se pudo iniciar PostgreSQL E2E en Docker. Inicia Docker Desktop o ejecuta Playwright con PLAYWRIGHT_USE_LOCAL_DB=1. Detalle: ${error.message}`);
  }
}

export async function waitForPostgresReady({ timeoutMs = 60_000 } = {}) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const result = await runDocker([
      'exec',
      POSTGRES_CONTAINER_NAME,
      'pg_isready',
      '-U', POSTGRES_USER,
      '-d', POSTGRES_DB,
    ], { allowFailure: true });

    if (result.code === 0) {
      return;
    }

    await sleep(1_000);
  }

  throw new Error(`PostgreSQL E2E container did not become ready within ${timeoutMs}ms.`);
}
