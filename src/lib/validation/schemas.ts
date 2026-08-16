import { z } from 'zod';
export const searchSchema = z.object({ query: z.string().trim().min(1).max(180), format: z.enum(['all', 'mp3', 'flac', 'aac', 'ogg']).default('all') });
export const connectionSchema = z.object({ username: z.string().trim().min(1).max(64), password: z.string().min(1).max(256), port: z.coerce.number().int().min(1).max(65535), apiUrl: z.string().url().optional().or(z.literal('')), apiToken: z.string().max(512).optional() });
export const transferActionSchema = z.object({ action: z.enum(['pause', 'resume', 'cancel']) });
