import { Worker } from '../../Domain/Entities/Worker';
import { IWorkerRepository } from '../../Domain/Repository/IWorkerRepository';

export class CreateWorkerUseCase {
  constructor(private workerRepository: IWorkerRepository) {}

  async execute(data: Omit<Worker, 'id' | 'createdAt' | 'updatedAt'>): Promise<Worker> {
    // Validaciones
    if (!data.name || data.name.trim() === '') {
      throw new Error('El nombre es requerido');
    }

    if (!data.roles || data.roles.length === 0) {
      throw new Error('Debe seleccionar al menos un rol');
    }

    if (data.paymentPerSale === undefined || data.paymentPerSale < 0) {
      throw new Error('El pago por venta debe ser un número positivo');
    }

    const worker: Worker = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.workerRepository.create(worker);
  }
}
