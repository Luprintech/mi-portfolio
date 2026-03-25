/**
 * migrate.js — runner de migraciones SQL versionado.
 *
 * Aplica en orden ascendente todos los archivos *.sql de /db/migrations/
 * que aún no hayan sido registrados en la tabla schema_migrations.
 *
 * Uso:
 *   node scripts/migrate.js
 *
 * La tabla schema_migrations se crea automáticamente si no existe.
 * Cada migración se ejecuta dentro de una transacción (fallo → rollback).
 */

import 'dotenv/config';
import fsExtra from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool } from '../lib/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, '..', 'db', 'migrations');

async function ensureMigrationsTable(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id          SERIAL      PRIMARY KEY,
            filename    TEXT        UNIQUE NOT NULL,
            applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `);
}

async function getAppliedMigrations(client) {
    const result = await client.query(
        'SELECT filename FROM schema_migrations ORDER BY filename ASC'
    );
    return new Set(result.rows.map((r) => r.filename));
}

async function getPendingMigrations(applied) {
    const files = await fsExtra.readdir(MIGRATIONS_DIR);
    return files
        .filter((f) => f.endsWith('.sql') && !applied.has(f))
        .sort();
}

async function applyMigration(client, filename) {
    const filePath = path.join(MIGRATIONS_DIR, filename);
    const sql = await fsExtra.readFile(filePath, 'utf-8');

    console.log(`  Applying: ${filename}`);
    await client.query(sql);
    await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [filename]
    );
}

async function run() {
    const pool = getPool();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        await ensureMigrationsTable(client);

        const applied = await getAppliedMigrations(client);
        const pending = await getPendingMigrations(applied);

        if (pending.length === 0) {
            console.log('✅ No pending migrations.');
            await client.query('COMMIT');
            return;
        }

        console.log(`Running ${pending.length} migration(s)...`);

        for (const filename of pending) {
            await applyMigration(client, filename);
        }

        await client.query('COMMIT');
        console.log(`✅ Applied ${pending.length} migration(s) successfully.`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed — rolled back:', error.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
