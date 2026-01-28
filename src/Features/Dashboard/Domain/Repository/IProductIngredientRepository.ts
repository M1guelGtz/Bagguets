import { ProductIngredient } from '../Entities/ProductIngredient';

export interface IProductIngredientRepository {
  create(productIngredient: Omit<ProductIngredient, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductIngredient>;
  update(id: string, productIngredient: Partial<ProductIngredient>): Promise<ProductIngredient>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<ProductIngredient | null>;
  getByProductId(productId: string): Promise<ProductIngredient[]>;
  getAll(): Promise<ProductIngredient[]>;
  deleteByProductAndIngredient(productId: string, ingredientId: string): Promise<void>;
}
