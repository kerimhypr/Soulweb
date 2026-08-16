import 'server-only';
import { Pool, type PoolClient } from 'pg';

let pool: Pool | undefined;
let schemaPromise: Promise<void> | undefined;

export function database(): Pool {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined, max: 5 });
  return pool;
}

export async function ensureSchema(): Promise<void> {
  if (!schemaPromise) schemaPromise = (async () => {
    const client: PoolClient = await database().connect();
    try {
      await client.query(`
        CREATE EXTENSION IF NOT EXISTS pgcrypto;
        CREATE TABLE IF NOT EXISTS app_users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS app_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
          token_hash TEXT NOT NULL UNIQUE, expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS app_sessions_user_idx ON app_sessions(user_id);
        CREATE TABLE IF NOT EXISTS soulseek_connections (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL UNIQUE REFERENCES app_users(id) ON DELETE CASCADE,
          username TEXT NOT NULL, encrypted_password TEXT NOT NULL, encrypted_api_url TEXT, encrypted_api_token TEXT,
          port INTEGER NOT NULL DEFAULT 2234, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS soulseek_workers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL UNIQUE REFERENCES app_users(id) ON DELETE CASCADE,
          provider TEXT NOT NULL, service_id TEXT, private_endpoint TEXT,
          status TEXT NOT NULL CHECK (status IN ('pending', 'provisioning', 'ready', 'failed', 'deleting')),
          last_error TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS soulseek_workers_status_idx ON soulseek_workers(status);
      `);
    } finally { client.release(); }
  })().catch(error => { schemaPromise = undefined; throw error; });
  return schemaPromise;
}
