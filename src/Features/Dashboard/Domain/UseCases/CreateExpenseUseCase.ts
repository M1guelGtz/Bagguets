import { Expense } from '../Entities/Expense';
import { ICashRegisterRepository } from '../Repository/ICashRegisterRepository';
import { IExpenseRepository } from '../Repository/IExpenseRepository';

export class CreateExpenseUseCase {
  constructor(
    private expenseRepository: IExpenseRepository,
    private cashRegisterRepository: ICashRegisterRepository
  ) {}

  async execute(
    description: string,
    amount: number,
    category: Expense['category'],
    userId: string,
    notes?: string
  ): Promise<Expense> {
    if (!description || description.trim() === '') {
      throw new Error('La descripción del gasto es requerida');
    }

    if (amount <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    // Verificar que hay una caja abierta
    const cashRegister = await this.cashRegisterRepository.getCurrent();
    if (!cashRegister) {
      throw new Error('No hay una caja abierta. Por favor, abre la caja primero.');
    }

    const expense = await this.expenseRepository.create({
      description,
      amount,
      category,
      cashRegisterId: cashRegister.id,
      userId,
      notes,
    });

    // Actualizar totales de caja
    await this.cashRegisterRepository.updateTotals(
      cashRegister.id,
      cashRegister.totalSales,
      cashRegister.totalExpenses + amount
    );

    return expense;
  }
}
