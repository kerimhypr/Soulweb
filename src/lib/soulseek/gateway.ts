import { z } from 'zod';
import type { SearchResult, ServerStatus, SoulseekUser, Transfer, UserFile } from '@/types';

/**
 * The only contract a backend integration must implement. It deliberately has
 * no browser dependencies: credentials and access tokens stay server-side.
 */
export interface SoulseekGateway {
  searchFiles(query: string, format: string): Promise<SearchResult[]>;
  getTransfers(): Promise<Transfer[]>;
  queueDownload(resultId: string): Promise<void>;
  pauseTransfer(id: string): Promise<void>;
  resumeTransfer(id: string): Promise<void>;
  cancelTransfer(id: string): Promise<void>;
  getUser(username: string): Promise<SoulseekUser>;
  getUserFiles(username: string): Promise<UserFile[]>;
  getServerStatus(): Promise<ServerStatus>;
}

const rawSearchResult = z.object({
  id: z.string().min(1),
  file: z.string().min(1),
  user: z.string().min(1),
  format: z.string().min(1),
  bitrate: z.string().min(1),
  size: z.string().min(1),
  duration: z.string().min(1),
  slots: z.string().min(1),
  available: z.boolean(),
  previewUrl: z.string().url().optional()
}).strict();

/** Validate gateway data before it reaches UI components. */
export function parseSearchResults(payload: unknown): SearchResult[] {
  return z.array(rawSearchResult).max(1_000).parse(payload);
}

export function parseTransfers(payload: unknown): Transfer[] {
  return z.array(z.object({
    id: z.string().min(1), file: z.string().min(1), user: z.string().min(1),
    size: z.string().min(1), transferred: z.string().min(1), progress: z.number().min(0).max(100),
    speed: z.string().min(1), eta: z.string().min(1),
    state: z.enum(['queued', 'transferring', 'paused', 'completed', 'failed']),
    direction: z.enum(['download', 'upload'])
  }).strict()).max(1_000).parse(payload);
}
