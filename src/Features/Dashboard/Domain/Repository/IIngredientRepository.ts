import { Ingredient } from '../Entities/Ingredient';

export interface IIngredientRepository {
  create(ingredient: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ingredient>;
  update(id: string, ingredient: Partial<Ingredient>): Promise<Ingredient>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<Ingredient | null>;
  getAll(): Promise<Ingredient[]>;
  updateStock(id: string, quantity: number): Promise<void>;
}
