import 'server-only';
import type { WorkerProvisionRequest, WorkerProvisionResult, WorkerProvisioner, WorkerRecord } from './types';
export class RailwayWorkerProvisioner implements WorkerProvisioner {
  async provision(_request: WorkerProvisionRequest): Promise<WorkerProvisionResult> {
    if (!process.env.RAILWAY_API_TOKEN || !process.env.RAILWAY_PROJECT_ID) throw new Error('Worker provisioning is unavailable: Railway control-plane credentials are not configured.');
    throw new Error('Worker provisioning adapter is not enabled for this deployment.');
  }
  async destroy(_worker: WorkerRecord): Promise<void> { if (!process.env.RAILWAY_API_TOKEN || !process.env.RAILWAY_PROJECT_ID) return; throw new Error('Worker deprovisioning adapter is not enabled for this deployment.'); }
}
export const workerProvisioner = new RailwayWorkerProvisioner();
