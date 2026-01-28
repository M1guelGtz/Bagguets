import { WorkerParticipation } from '../../Domain/Entities/WorkerParticipation';
import { IWorkerParticipationRepository } from '../../Domain/Repository/IWorkerParticipationRepository';
import { IWorkerRepository } from '../../Domain/Repository/IWorkerRepository';

interface WorkerAssignment {
  cookId?: string;
  deliveryId?: string;
}

export class AssignWorkersToSaleUseCase {
  constructor(
    private workerParticipationRepository: IWorkerParticipationRepository,
    private workerRepository: IWorkerRepository
  ) {}

  async execute(
    saleId: string,
    workers: WorkerAssignment
  ): Promise<WorkerParticipation[]> {
    const participations: WorkerParticipation[] = [];

    // Asignar cocinero
    if (workers.cookId) {
      const cook = await this.workerRepository.getById(workers.cookId);
      if (!cook) throw new Error('Cocinero no encontrado');
      if (!cook.active) throw new Error('El cocinero no está activo');

      const cookParticipation: WorkerParticipation = {
        id: crypto.randomUUID(),
        saleId,
        workerId: cook.id,
        workerName: cook.name,
        role: 'COCINERO',
        payment: cook.paymentPerSale,
        paid: false,
        date: new Date()
      };

      await this.workerParticipationRepository.create(cookParticipation);
      participations.push(cookParticipation);
    }

    // Asignar repartidor
    if (workers.deliveryId) {
      const delivery = await this.workerRepository.getById(workers.deliveryId);
      if (!delivery) throw new Error('Repartidor no encontrado');
      if (!delivery.active) throw new Error('El repartidor no está activo');

      const deliveryParticipation: WorkerParticipation = {
        id: crypto.randomUUID(),
        saleId,
        workerId: delivery.id,
        workerName: delivery.name,
        role: 'REPARTIDOR',
        payment: delivery.paymentPerSale,
        paid: false,
        date: new Date()
      };

      await this.workerParticipationRepository.create(deliveryParticipation);
      participations.push(deliveryParticipation);
    }

    return participations;
  }
}
