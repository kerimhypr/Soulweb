import { demoResults, demoTransfers } from './demo';
import type { ConnectionStatus, SearchResult, ServerStatus, SoulseekUser, Transfer, UserFile } from '@/types';
import { parseSearchResults, parseTransfers, type SoulseekGateway } from './gateway';
import type { ConnectionConfig } from '@/lib/config/connection';
import { SlskdGateway } from './slskd';

const apiUrl = process.env.SOULSEEK_API_URL;
const demo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
function requiresGateway(): never { throw new Error('The configured gateway adapter has not been implemented. See README for the adapter contract.'); }
export function createGatewayClient(gateway: SoulseekGateway) {
  return {
    searchFiles: async (query: string, format: string) => parseSearchResults(await gateway.searchFiles(query, format)),
    getTransfers: async () => parseTransfers(await gateway.getTransfers()),
    queueDownload: (id: string) => gateway.queueDownload(id),
    pauseTransfer: (id: string) => gateway.pauseTransfer(id),
    resumeTransfer: (id: string) => gateway.resumeTransfer(id),
    cancelTransfer: (id: string) => gateway.cancelTransfer(id)
  };
}
function liveGateway(connection: ConnectionConfig | null | undefined): SoulseekGateway { if (!connection) requiresGateway(); return new SlskdGateway(connection); }
export async function searchFiles(query: string, format = 'all'): Promise<SearchResult[]> {
  if (demo) return demoResults.filter(item => item.file.toLowerCase().includes(query.toLowerCase()) && (format === 'all' || item.format.toLowerCase() === format));
  return requiresGateway();
}
export async function searchConnectedFiles(query: string, format: string, connection: ConnectionConfig | null): Promise<SearchResult[]> { return demo ? searchFiles(query, format) : liveGateway(connection).searchFiles(query, format); }
export async function getTransfers(connection?: ConnectionConfig | null): Promise<Transfer[]> { return demo ? demoTransfers : liveGateway(connection).getTransfers(); }
export async function getConnectionStatus(connection?: ConnectionConfig | null): Promise<ConnectionStatus> {
  if (demo) return { connected: false, mode: 'demo', message: 'Demo mode is active; no Soulseek backend is connected.' };
  if (!connection && !apiUrl) return { connected: false, mode: 'unconfigured', message: 'Configure a server-side Soulseek gateway to continue.' };
  return { connected: false, mode: 'live', message: 'A gateway is configured. Its adapter must be enabled before requesting network operations.' };
}
export async function queueDownload(resultId: string, connection?: ConnectionConfig | null): Promise<void> { if (!demo) await liveGateway(connection).queueDownload(resultId); }
export async function pauseTransfer(id: string, connection?: ConnectionConfig | null): Promise<void> { if (!demo) await liveGateway(connection).pauseTransfer(id); }
export async function resumeTransfer(id: string, connection?: ConnectionConfig | null): Promise<void> { if (!demo) await liveGateway(connection).resumeTransfer(id); }
export async function cancelTransfer(id: string, connection?: ConnectionConfig | null): Promise<void> { if (!demo) await liveGateway(connection).cancelTransfer(id); }
export async function getUser(username: string, connection?: ConnectionConfig | null): Promise<SoulseekUser> { if (demo) return { username, status: 'Demo user' }; return liveGateway(connection).getUser(username); }
export async function getUserFiles(username: string, connection?: ConnectionConfig | null): Promise<UserFile[]> { if (demo) return []; return liveGateway(connection).getUserFiles(username); }
export async function getServerStatus(connection?: ConnectionConfig | null): Promise<ServerStatus> { if (demo) return { connected: false, message: 'Demo mode is active.' }; return liveGateway(connection).getServerStatus(); }
