import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { database, ensureSchema } from '@/lib/db';

const cookieName = 'soulweb_session';
const ttlSeconds = 60 * 60 * 24 * 30;
const digest = (value: string) => createHash('sha256').update(value).digest('hex');

export async function createUser(email: string, passwordHash: string): Promise<string> {
  await ensureSchema();
  const result = await database().query<{ id: string }>('INSERT INTO app_users (email, password_hash) VALUES ($1, $2) RETURNING id', [email, passwordHash]);
  return result.rows[0].id;
}

export async function verifyUser(email: string): Promise<{ id: string; passwordHash: string } | null> {
  await ensureSchema();
  const result = await database().query<{ id: string; password_hash: string }>('SELECT id, password_hash FROM app_users WHERE email = $1', [email]);
  return result.rows[0] ? { id: result.rows[0].id, passwordHash: result.rows[0].password_hash } : null;
}

export async function establishSession(userId: string): Promise<void> {
  await ensureSchema();
  const token = randomBytes(32).toString('base64url');
  await database().query('DELETE FROM app_sessions WHERE user_id = $1 OR expires_at < now()', [userId]);
  await database().query('INSERT INTO app_sessions (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval \'30 days\')', [userId, digest(token)]);
  cookies().set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: ttlSeconds });
}

export async function currentUser(): Promise<{ id: string; email: string } | null> {
  const token = cookies().get(cookieName)?.value;
  if (!token) return null;
  try { await ensureSchema(); const result = await database().query<{ id: string; email: string }>('SELECT u.id, u.email FROM app_sessions s JOIN app_users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.expires_at > now()', [digest(token)]); return result.rows[0] ?? null; } catch { return null; }
}
export async function requireUser(): Promise<{ id: string; email: string }> { const user = await currentUser(); if (!user) throw new Error('UNAUTHORIZED'); return user; }

export async function destroySession(): Promise<void> {
  const token = cookies().get(cookieName)?.value;
  if (token && process.env.DATABASE_URL) await database().query('DELETE FROM app_sessions WHERE token_hash = $1', [digest(token)]);
  cookies().set(cookieName, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
}
