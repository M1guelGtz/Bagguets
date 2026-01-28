import { WorkerPayment } from '../../Domain/Entities/WorkerPayment';
import { IWorkerPaymentRepository } from '../../Domain/Repository/IWorkerPaymentRepository';

export class LocalStorageWorkerPaymentRepository implements IWorkerPaymentRepository {
  private readonly STORAGE_KEY = 'worker_payments';

  async create(payment: WorkerPayment): Promise<WorkerPayment> {
    const payments = await this.getAll();
    payments.push(payment);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payments));
    return payment;
  }

  async getAll(): Promise<WorkerPayment[]> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data).map((p: WorkerPayment) => ({
      ...p,
      date: new Date(p.date)
    }));
  }

  async getByWorkerId(workerId: string): Promise<WorkerPayment[]> {
    const payments = await this.getAll();
    return payments.filter(p => p.workerId === workerId);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<WorkerPayment[]> {
    const payments = await this.getAll();
    return payments.filter(p => {
      const paymentDate = new Date(p.date);
      return paymentDate >= startDate && paymentDate <= endDate;
    });
  }
}
