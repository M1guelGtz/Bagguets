import { WorkerPayment } from '../../Domain/Entities/WorkerPayment';
import { IWorkerParticipationRepository } from '../../Domain/Repository/IWorkerParticipationRepository';
import { IWorkerPaymentRepository } from '../../Domain/Repository/IWorkerPaymentRepository';

export class PayWorkerUseCase {
  constructor(
    private workerParticipationRepository: IWorkerParticipationRepository,
    private workerPaymentRepository: IWorkerPaymentRepository
  ) {}

  async execute(
    workerId: string,
    amount: number,
    userId: string,
    notes?: string
  ): Promise<WorkerPayment> {
    if (amount <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    // Obtener participaciones no pagadas
    const unpaidParticipations = await this.workerParticipationRepository.getUnpaid(workerId);
    
    if (unpaidParticipations.length === 0) {
      throw new Error('No hay pagos pendientes para este trabajador');
    }

    // Calcular total pendiente
    const totalPending = unpaidParticipations.reduce((sum, p) => sum + p.payment, 0);

    if (amount > totalPending) {
      throw new Error(`El monto excede lo pendiente ($${totalPending})`);
    }

    // Marcar participaciones como pagadas
    let remainingAmount = amount;
    const paidParticipationIds: string[] = [];

    for (const participation of unpaidParticipations) {
      if (remainingAmount >= participation.payment) {
        participation.paid = true;
        await this.workerParticipationRepository.update(participation);
        paidParticipationIds.push(participation.id);
        remainingAmount -= participation.payment;
      }
      
      if (remainingAmount === 0) break;
    }

    // Crear registro de pago
    const payment: WorkerPayment = {
      id: crypto.randomUUID(),
      workerId,
      workerName: unpaidParticipations[0].workerName,
      amount,
      participationIds: paidParticipationIds,
      date: new Date(),
      notes,
      userId
    };

    return this.workerPaymentRepository.create(payment);
  }
}
