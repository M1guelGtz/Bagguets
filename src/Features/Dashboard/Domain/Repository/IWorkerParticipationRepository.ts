import { WorkerParticipation } from '../Entities/WorkerParticipation';

export interface IWorkerParticipationRepository {
  create(participation: WorkerParticipation): Promise<WorkerParticipation>;
  getAll(): Promise<WorkerParticipation[]>;
  getBySaleId(saleId: string): Promise<WorkerParticipation[]>;
  getByWorkerId(workerId: string): Promise<WorkerParticipation[]>;
  getUnpaid(workerId?: string): Promise<WorkerParticipation[]>;
  update(participation: WorkerParticipation): Promise<WorkerParticipation>;
}
