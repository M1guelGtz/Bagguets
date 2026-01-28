import { WorkerPayment } from '../Entities/WorkerPayment';

export interface IWorkerPaymentRepository {
  create(payment: WorkerPayment): Promise<WorkerPayment>;
  getAll(): Promise<WorkerPayment[]>;
  getByWorkerId(workerId: string): Promise<WorkerPayment[]>;
  getByDateRange(startDate: Date, endDate: Date): Promise<WorkerPayment[]>;
}
