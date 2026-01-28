import { IWorkerParticipationRepository } from '../../Domain/Repository/IWorkerParticipationRepository';
import { IWorkerPaymentRepository } from '../../Domain/Repository/IWorkerPaymentRepository';

export interface WorkerEarnings {
  workerId: string;
  workerName: string;
  totalSales: number;
  totalEarned: number;
  totalPaid: number;
  totalPending: number;
}

export class GetWorkerEarningsUseCase {
  constructor(
    private workerParticipationRepository: IWorkerParticipationRepository,
    private workerPaymentRepository: IWorkerPaymentRepository
  ) {}

  async execute(workerId?: string): Promise<WorkerEarnings[]> {
    const participations = workerId
      ? await this.workerParticipationRepository.getByWorkerId(workerId)
      : await this.workerParticipationRepository.getAll();

    const payments = workerId
      ? await this.workerPaymentRepository.getByWorkerId(workerId)
      : await this.workerPaymentRepository.getAll();

    // Agrupar por trabajador
    const earningsMap = new Map<string, WorkerEarnings>();

    participations.forEach(p => {
      if (!earningsMap.has(p.workerId)) {
        earningsMap.set(p.workerId, {
          workerId: p.workerId,
          workerName: p.workerName,
          totalSales: 0,
          totalEarned: 0,
          totalPaid: 0,
          totalPending: 0
        });
      }

      const earnings = earningsMap.get(p.workerId)!;
      earnings.totalSales++;
      earnings.totalEarned += p.payment;
      if (p.paid) {
        earnings.totalPaid += p.payment;
      } else {
        earnings.totalPending += p.payment;
      }
    });

    // Verificar pagos adicionales
    payments.forEach(payment => {
      if (earningsMap.has(payment.workerId)) {
        // Los pagos ya están reflejados en las participaciones
        // Este bloque puede usarse para validaciones adicionales
      }
    });

    return Array.from(earningsMap.values());
  }
}
