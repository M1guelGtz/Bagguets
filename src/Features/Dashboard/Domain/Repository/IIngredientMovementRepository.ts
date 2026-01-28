import { IngredientMovement } from '../Entities/IngredientMovement';

export interface IIngredientMovementRepository {
  create(movement: Omit<IngredientMovement, 'id' | 'date'>): Promise<IngredientMovement>;
  getAll(): Promise<IngredientMovement[]>;
  getByIngredientId(ingredientId: string): Promise<IngredientMovement[]>;
  getByDateRange(startDate: Date, endDate: Date): Promise<IngredientMovement[]>;
}
