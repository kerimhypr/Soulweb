import 'server-only';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import type { z } from 'zod';
import { connectionSchema } from '@/lib/validation/schemas';

const cookieName = 'seeker_connection';
type ConnectionInput = z.infer<typeof connectionSchema>;
export type ConnectionConfig = Required<Pick<ConnectionInput, 'username' | 'password' | 'port'>> & Pick<ConnectionInput, 'apiUrl' | 'apiToken'>;

function encryptionKey(): Buffer | null {
  const encoded = process.env.CONFIG_ENCRYPTION_KEY;
  if (!encoded) return null;
  try { const key = Buffer.from(encoded, 'base64'); return key.length === 32 ? key : null; } catch { return null; }
}
function seal(config: ConnectionConfig, key: Buffer): string {
  const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(config), 'utf8'), cipher.final()]);
  return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${ciphertext.toString('base64url')}`;
}
function unseal(value: string, key: Buffer): ConnectionConfig | null {
  try { const [iv, tag, ciphertext] = value.split('.'); if (!iv || !tag || !ciphertext) return null; const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url')); decipher.setAuthTag(Buffer.from(tag, 'base64url')); const parsed: unknown = JSON.parse(Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64url')), decipher.final()]).toString('utf8')); const result = connectionSchema.safeParse(parsed); return result.success ? result.data : null; } catch { return null; }
}
function allowedOrigins(): string[] { return (process.env.SOULSEEK_ALLOWED_API_ORIGINS ?? '').split(',').map(origin => origin.trim()).filter(Boolean); }
export function isAllowedGatewayUrl(value: string): boolean {
  if (!value) return Boolean(process.env.SOULSEEK_API_URL);
  try { const url = new URL(value); return url.protocol === 'https:' && allowedOrigins().includes(url.origin); } catch { return false; }
}
export function canPersistConnection(): boolean { return encryptionKey() !== null; }
export function saveConnection(config: ConnectionConfig): void {
  const key = encryptionKey(); if (!key) throw new Error('Encrypted connection storage is not configured.');
  if (config.apiUrl && !isAllowedGatewayUrl(config.apiUrl)) throw new Error('This backend URL is not on the server allowlist.');
  cookies().set(cookieName, seal(config, key), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 });
}
export function getConnection(): ConnectionConfig | null {
  const stored = cookies().get(cookieName)?.value; const key = encryptionKey(); if (stored && key) return unseal(stored, key);
  const env = connectionSchema.safeParse({ username: process.env.SOULSEEK_USERNAME, password: process.env.SOULSEEK_PASSWORD, port: process.env.SOULSEEK_PORT ?? '2234', apiUrl: process.env.SOULSEEK_API_URL ?? '', apiToken: process.env.SOULSEEK_API_TOKEN });
  return env.success ? env.data : null;
}
export function clearConnection(): void { cookies().set(cookieName, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 }); }
