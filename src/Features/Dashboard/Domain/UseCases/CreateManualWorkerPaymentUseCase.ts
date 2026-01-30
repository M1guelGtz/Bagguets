import { WorkerPayment } from '../Entities/WorkerPayment';
import { ICashRegisterRepository } from '../Repository/ICashRegisterRepository';
import { IExpenseRepository } from '../Repository/IExpenseRepository';
import { IWorkerPaymentRepository } from '../Repository/IWorkerPaymentRepository';
import { IWorkerRepository } from '../Repository/IWorkerRepository';

export class CreateManualWorkerPaymentUseCase {
  constructor(
    private workerPaymentRepository: IWorkerPaymentRepository,
    private workerRepository: IWorkerRepository,
    private expenseRepository: IExpenseRepository,
    private cashRegisterRepository: ICashRegisterRepository
  ) {}

  async execute(data: {
    workerId: string;
    amount: number;
    reason: string;
    notes?: string;
    userId: string;
  }): Promise<WorkerPayment> {
    // Validaciones
    if (!data.workerId) {
      throw new Error('Debe seleccionar un trabajador');
    }

    if (data.amount <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    if (!data.reason || data.reason.trim() === '') {
      throw new Error('La razón del pago es requerida');
    }

    // Verificar que el trabajador existe
    const worker = await this.workerRepository.getById(data.workerId);
    if (!worker) {
      throw new Error('Trabajador no encontrado');
    }

    // Verificar que hay una caja abierta
    const cashRegister = await this.cashRegisterRepository.getCurrent();
    if (!cashRegister) {
      throw new Error('No hay una caja abierta. Por favor, abre la caja primero.');
    }

    // Crear el pago manual
    const payment: WorkerPayment = {
      id: crypto.randomUUID(),
      workerId: worker.id,
      workerName: worker.name,
      amount: data.amount,
      participationIds: [],
      date: new Date(),
      notes: data.notes,
      userId: data.userId,
      paymentType: 'MANUAL',
      reason: data.reason
    };

    // Guardar el pago
    await this.workerPaymentRepository.create(payment);

    // Registrar como gasto/egreso
    await this.expenseRepository.create({
      id: crypto.randomUUID(),
      category: 'PAGO_TRABAJADOR_MANUAL',
      description: `Pago manual a ${worker.name}: ${data.reason}`,
      amount: data.amount,
      date: new Date(),
      notes: data.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Actualizar totales de caja
    await this.cashRegisterRepository.updateTotals(
      cashRegister.id,
      cashRegister.totalSales,
      cashRegister.totalExpenses + data.amount
    );

    return payment;
  }
}
