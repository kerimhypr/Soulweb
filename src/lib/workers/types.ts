import 'server-only';

export type WorkerStatus = 'pending' | 'provisioning' | 'ready' | 'failed' | 'deleting';
export type WorkerRecord = { id: string; userId: string; provider: string; serviceId: string | null; privateEndpoint: string | null; status: WorkerStatus; lastError: string | null };
export type WorkerProvisionRequest = { userId: string; soulseekUsername: string; soulseekPassword: string };
export type WorkerProvisionResult = { provider: string; serviceId: string; privateEndpoint: string };
export interface WorkerRepository { createPending(userId: string, provider: string): Promise<WorkerRecord>; markProvisioning(id: string): Promise<void>; markReady(id: string, result: WorkerProvisionResult): Promise<void>; markFailed(id: string, message: string): Promise<void>; remove(id: string): Promise<void>; findByUserId(userId: string): Promise<WorkerRecord | null>; }
export interface WorkerProvisioner { provision(request: WorkerProvisionRequest): Promise<WorkerProvisionResult>; destroy(worker: WorkerRecord): Promise<void>; }
