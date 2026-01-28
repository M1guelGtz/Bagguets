import { IIngredientMovementRepository } from '../Repository/IIngredientMovementRepository';
import { IIngredientRepository } from '../Repository/IIngredientRepository';

export class ConsumeIngredientsUseCase {
  constructor(
    private ingredientRepository: IIngredientRepository,
    private ingredientMovementRepository: IIngredientMovementRepository
  ) {}

  async execute(
    ingredients: Array<{ ingredientId: string; quantity: number }>,
    saleId: string,
    userId: string
  ): Promise<void> {
    for (const ingredient of ingredients) {
      const ingredientData = await this.ingredientRepository.getById(ingredient.ingredientId);
      if (!ingredientData) {
        throw new Error(`Insumo con ID ${ingredient.ingredientId} no encontrado`);
      }

      if (ingredientData.stock < ingredient.quantity) {
        throw new Error(
          `Stock insuficiente del insumo "${ingredientData.name}". Disponible: ${ingredientData.stock}, requerido: ${ingredient.quantity}`
        );
      }

      // Descontar del inventario
      await this.ingredientRepository.updateStock(ingredient.ingredientId, -ingredient.quantity);

      // Registrar movimiento
      await this.ingredientMovementRepository.create({
        ingredientId: ingredient.ingredientId,
        ingredientName: ingredientData.name,
        type: 'OUT',
        quantity: ingredient.quantity,
        reason: `Consumo por venta`,
        relatedSaleId: saleId,
        userId,
      });
    }
  }
}
