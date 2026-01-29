import { WorkerParticipation } from '../../Domain/Entities/WorkerParticipation';
import { IWorkerParticipationRepository } from '../../Domain/Repository/IWorkerParticipationRepository';
import { IWorkerRepository } from '../../Domain/Repository/IWorkerRepository';

interface WorkerAssignment {
  cookId?: string;
  deliveryId?: string;
  productCount?: number; // Número de productos vendidos en la venta
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
    const productCount = workers.productCount || 1;

    // Asignar cocinero
    if (workers.cookId) {
      const cook = await this.workerRepository.getById(workers.cookId);
      if (!cook) throw new Error('Cocinero no encontrado');
      if (!cook.active) throw new Error('El cocinero no está activo');

      // Calcular pago basado en número de productos
      const cookPayment = cook.paymentPerSale * productCount;

      const cookParticipation: WorkerParticipation = {
        id: crypto.randomUUID(),
        saleId,
        workerId: cook.id,
        workerName: cook.name,
        role: 'COCINERO',
        payment: cookPayment,
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

      // Calcular pago basado en número de productos
      const deliveryPayment = delivery.paymentPerSale * productCount;

      const deliveryParticipation: WorkerParticipation = {
        id: crypto.randomUUID(),
        saleId,
        workerId: delivery.id,
        workerName: delivery.name,
        role: 'REPARTIDOR',
        payment: deliveryPayment,
        paid: false,
        date: new Date()
      };

      await this.workerParticipationRepository.create(deliveryParticipation);
      participations.push(deliveryParticipation);
    }

    return participations;
  }
}
