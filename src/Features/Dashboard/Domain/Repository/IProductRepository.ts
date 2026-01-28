import { Product } from '../Entities/Product';

export interface IProductRepository {
  create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  update(id: string, product: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<Product | null>;
  getAll(): Promise<Product[]>;
  updateStock(id: string, quantity: number): Promise<void>;
}
