import 'server-only';
import type { ConnectionConfig } from '@/lib/config/connection';
import type { SearchResult, ServerStatus, SoulseekUser, Transfer, TransferState, UserFile } from '@/types';
import type { SoulseekGateway } from './gateway';

type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue | null => typeof value === 'object' && value !== null && !Array.isArray(value) ? value as RecordValue : null;
const text = (value: unknown, fallback = '—'): string => typeof value === 'string' && value.trim() ? value : fallback;
const number = (value: unknown, fallback = 0): number => typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const bytes = (value: number): string => value < 1024 * 1024 ? `${Math.round(value / 1024)} KB` : `${(value / 1024 / 1024).toFixed(1)} MB`;
const speed = (value: number): string => value > 0 ? `${(value / 1024 / 1024).toFixed(1)} MB/s` : '—';
const state = (value: unknown): TransferState => { const normalized = text(value, '').toLowerCase(); if (normalized.includes('succeed') || normalized.includes('complete')) return 'completed'; if (normalized.includes('pause')) return 'paused'; if (normalized.includes('fail') || normalized.includes('error') || normalized.includes('cancel')) return 'failed'; if (normalized.includes('queue')) return 'queued'; return 'transferring'; };
const opaqueId = (username: string, filename: string): string => Buffer.from(`${username}\u0000${filename}`, 'utf8').toString('base64url');
const decodeId = (id: string): [string, string] | null => { try { const [username, filename] = Buffer.from(id, 'base64url').toString('utf8').split('\u0000'); return username && filename ? [username, filename] : null; } catch { return null; } };

export class SlskdGateway implements SoulseekGateway {
  private readonly base: string;
  private token: string | null = null;
  constructor(private readonly config: ConnectionConfig) { this.base = (config.apiUrl || process.env.SOULSEEK_API_URL || '').replace(/\/$/, ''); }
  private async headers(): Promise<HeadersInit> {
    if (this.config.apiToken) return { 'X-API-Key': this.config.apiToken, Accept: 'application/json' };
    if (!this.token) { const response = await fetch(`${this.base}/api/v0/session`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ username: this.config.username, password: this.config.password }), cache: 'no-store' }); if (!response.ok) throw new Error('Gateway authentication failed.'); const data = record(await response.json()); const token = data?.token; if (typeof token !== 'string' || !token) throw new Error('Gateway returned no session token.'); this.token = token; }
    return { Authorization: `Bearer ${this.token}`, Accept: 'application/json' };
  }
  private async request(path: string, init: RequestInit = {}): Promise<unknown> { const response = await fetch(`${this.base}${path}`, { ...init, headers: { ...(await this.headers()), ...init.headers }, cache: 'no-store' }); if (!response.ok) throw new Error(`Gateway request failed (${response.status}).`); if (response.status === 204) return null; return response.json(); }
  async searchFiles(query: string): Promise<SearchResult[]> {
    const id = crypto.randomUUID(); await this.request('/api/v0/searches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, searchText: query }) });
    const payload = await this.request(`/api/v0/searches/${id}/responses`); const responses = Array.isArray(payload) ? payload : [];
    return responses.flatMap((entry) => { const source = record(entry); const username = text(source?.username ?? source?.user); const files = Array.isArray(source?.files) ? source.files : []; return files.slice(0, 500).map((file) => { const data = record(file); const filename = text(data?.filename ?? data?.file); const extension = filename.split('.').pop()?.toUpperCase() || 'FILE'; const bitrate = number(data?.bitRate ?? data?.bitrate); const length = number(data?.length ?? data?.duration); const size = number(data?.size); return { id: opaqueId(username, filename), file: filename, user: username, format: extension, bitrate: bitrate ? `${bitrate} kbps` : 'Unknown', size: bytes(size), duration: length ? `${Math.floor(length / 60)}:${Math.floor(length % 60).toString().padStart(2, '0')}` : '—', slots: `${number(source?.freeUploadSlots)} / ${number(source?.uploadSlots)}`, available: number(source?.freeUploadSlots) > 0 }; }); });
  }
  async getTransfers(): Promise<Transfer[]> { const [downloads, uploads] = await Promise.all([this.request('/api/v0/transfers/downloads'), this.request('/api/v0/transfers/uploads')]); return [...this.mapTransfers(downloads, 'download'), ...this.mapTransfers(uploads, 'upload')]; }
  private mapTransfers(payload: unknown, direction: 'download' | 'upload'): Transfer[] { return (Array.isArray(payload) ? payload : []).map((entry) => { const value = record(entry); const sizeBytes = number(value?.size); const done = number(value?.bytesTransferred); const percent = number(value?.percentComplete, sizeBytes ? done / sizeBytes * 100 : 0); const remote = text(value?.remoteFilename ?? value?.filename); const username = text(value?.username); return { id: opaqueId(username, remote), file: remote, user: username, size: bytes(sizeBytes), transferred: bytes(done), progress: Math.max(0, Math.min(100, percent)), speed: speed(number(value?.averageSpeed)), eta: number(value?.averageSpeed) > 0 ? `${Math.ceil(Math.max(0, sizeBytes - done) / number(value?.averageSpeed))}s` : '—', state: state(value?.state), direction }; }); }
  async queueDownload(resultId: string): Promise<void> { const target = decodeId(resultId); if (!target) throw new Error('A gateway filename and username are required.'); const [username, filename] = target; await this.request(`/api/v0/transfers/downloads/${encodeURIComponent(username)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename }) }); }
  async pauseTransfer(): Promise<void> { throw new Error('This slskd API adapter does not expose a pause operation.'); }
  async resumeTransfer(): Promise<void> { throw new Error('This slskd API adapter does not expose a resume operation.'); }
  async cancelTransfer(id: string): Promise<void> { const target = decodeId(id); if (!target) throw new Error('Invalid transfer identifier.'); const [username, filename] = target; await this.request(`/api/v0/transfers/downloads/${encodeURIComponent(username)}/${encodeURIComponent(filename)}`, { method: 'DELETE' }); }
  async getUser(username: string): Promise<SoulseekUser> { const payload = record(await this.request(`/api/v0/users/${encodeURIComponent(username)}/info`)); return { username, status: text(payload?.status, 'Unknown'), description: typeof payload?.description === 'string' ? payload.description : undefined, files: number(payload?.fileCount), directories: number(payload?.directoryCount) }; }
  async getUserFiles(username: string): Promise<UserFile[]> { const payload = await this.request(`/api/v0/users/${encodeURIComponent(username)}/browse`); const directories = Array.isArray(payload) ? payload : []; return directories.flatMap(directory => { const value = record(directory); const files = Array.isArray(value?.files) ? value.files : []; return files.map(file => { const entry = record(file); const filename = text(entry?.filename); return { filename, size: number(entry?.size), extension: filename.split('.').pop()?.toUpperCase() || 'FILE' }; }); }); }
  async getServerStatus(): Promise<ServerStatus> { const payload = record(await this.request('/api/v0/server')); return { connected: Boolean(payload?.isConnected ?? payload?.connected), address: typeof payload?.address === 'string' ? payload.address : undefined, message: text(payload?.state ?? payload?.status, 'Unknown') }; }
}
