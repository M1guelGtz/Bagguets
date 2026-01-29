import { Expense } from '../Entities/Expense';
import { ICashRegisterRepository } from '../Repository/ICashRegisterRepository';
import { IExpenseRepository } from '../Repository/IExpenseRepository';
import { IIngredientMovementRepository } from '../Repository/IIngredientMovementRepository';
import { IIngredientRepository } from '../Repository/IIngredientRepository';

export class CreateExpenseUseCase {
  constructor(
    private expenseRepository: IExpenseRepository,
    private cashRegisterRepository: ICashRegisterRepository,
    private ingredientRepository: IIngredientRepository,
    private ingredientMovementRepository: IIngredientMovementRepository
  ) {}

  async execute(
    description: string,
    amount: number,
    category: Expense['category'],
    userId: string,
    notes?: string,
    ingredientId?: string,
    quantity?: number
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

    // Si se vinculó con un ingrediente, actualizar su stock
    if (ingredientId && quantity && quantity > 0) {
      const ingredient = await this.ingredientRepository.getById(ingredientId);
      if (!ingredient) {
        throw new Error('Ingrediente no encontrado');
      }

      // Actualizar stock del ingrediente
      ingredient.stock += quantity;
      ingredient.updatedAt = new Date();
      await this.ingredientRepository.update(ingredient.id, ingredient);

      // Registrar movimiento de ingrediente
      await this.ingredientMovementRepository.create({
        ingredientId,
        ingredientName: ingredient.name,
        quantity,
        type: 'IN',
        reason: `Compra vinculada a gasto: ${description}`,
        userId,
      });
    }

    // Actualizar totales de caja
    await this.cashRegisterRepository.updateTotals(
      cashRegister.id,
      cashRegister.totalSales,
      cashRegister.totalExpenses + amount
    );

    return expense;
  }
}
