import { Ingredient } from '../Entities/Ingredient';
import { IIngredientRepository } from '../Repository/IIngredientRepository';

export class CreateIngredientUseCase {
  constructor(private ingredientRepository: IIngredientRepository) {}

  async execute(ingredientData: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ingredient> {
    if (!ingredientData.name || ingredientData.name.trim() === '') {
      throw new Error('El nombre del insumo es requerido');
    }
    if (ingredientData.stock < 0) {
      throw new Error('El stock no puede ser negativo');
    }
    if (ingredientData.cost < 0) {
      throw new Error('El costo no puede ser negativo');
    }
    return await this.ingredientRepository.create(ingredientData);
  }
}
