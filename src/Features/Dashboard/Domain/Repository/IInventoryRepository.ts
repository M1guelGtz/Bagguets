import { InventoryMovement } from '../Entities/InventoryMovement';

export interface IInventoryRepository {
  create(movement: Omit<InventoryMovement, 'id' | 'date'>): Promise<InventoryMovement>;
  getAll(): Promise<InventoryMovement[]>;
  getByProductId(productId: string): Promise<InventoryMovement[]>;
  getByDateRange(startDate: Date, endDate: Date): Promise<InventoryMovement[]>;
}
