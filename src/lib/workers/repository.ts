import 'server-only';
import { database, ensureSchema } from '@/lib/db';
import type { WorkerProvisionResult, WorkerRecord, WorkerRepository, WorkerStatus } from './types';
type Row = { id: string; user_id: string; provider: string; service_id: string | null; private_endpoint: string | null; status: WorkerStatus; last_error: string | null };
const map = (row: Row): WorkerRecord => ({ id: row.id, userId: row.user_id, provider: row.provider, serviceId: row.service_id, privateEndpoint: row.private_endpoint, status: row.status, lastError: row.last_error });
export class PostgresWorkerRepository implements WorkerRepository {
  async createPending(userId: string, provider: string) { await ensureSchema(); const result = await database().query<Row>(`INSERT INTO soulseek_workers (user_id, provider, status) VALUES ($1, $2, 'pending') ON CONFLICT (user_id) DO UPDATE SET provider = EXCLUDED.provider, status = 'pending', last_error = NULL, updated_at = now() RETURNING id, user_id, provider, service_id, private_endpoint, status, last_error`, [userId, provider]); return map(result.rows[0]); }
  async markProvisioning(id: string) { await ensureSchema(); await database().query(`UPDATE soulseek_workers SET status = 'provisioning', last_error = NULL, updated_at = now() WHERE id = $1`, [id]); }
  async markReady(id: string, result: WorkerProvisionResult) { await ensureSchema(); await database().query(`UPDATE soulseek_workers SET provider = $2, service_id = $3, private_endpoint = $4, status = 'ready', last_error = NULL, updated_at = now() WHERE id = $1`, [id, result.provider, result.serviceId, result.privateEndpoint]); }
  async markFailed(id: string, message: string) { await ensureSchema(); await database().query(`UPDATE soulseek_workers SET status = 'failed', last_error = $2, updated_at = now() WHERE id = $1`, [id, message.slice(0, 500)]); }
  async remove(id: string) { await ensureSchema(); await database().query(`DELETE FROM soulseek_workers WHERE id = $1`, [id]); }
  async findByUserId(userId: string) { await ensureSchema(); const result = await database().query<Row>(`SELECT id, user_id, provider, service_id, private_endpoint, status, last_error FROM soulseek_workers WHERE user_id = $1`, [userId]); return result.rows[0] ? map(result.rows[0]) : null; }
}
export const workerRepository = new PostgresWorkerRepository();
