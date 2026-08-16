import 'server-only';
import { workerProvisioner } from './provisioner';
import { workerRepository } from './repository';
import type { WorkerProvisionRequest } from './types';
export async function provisionWorkerForUser(request: WorkerProvisionRequest): Promise<void> { const worker = await workerRepository.createPending(request.userId, 'railway'); await workerRepository.markProvisioning(worker.id); try { const result = await workerProvisioner.provision(request); await workerRepository.markReady(worker.id, result); } catch (error) { const message = error instanceof Error ? error.message : 'Worker provisioning failed.'; await workerRepository.markFailed(worker.id, message); throw new Error(message); } }
