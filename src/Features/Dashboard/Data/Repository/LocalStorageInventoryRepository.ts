import { InventoryMovement } from '../../Domain/Entities/InventoryMovement';
import { IInventoryRepository } from '../../Domain/Repository/IInventoryRepository';

export class LocalStorageInventoryRepository implements IInventoryRepository {
  private readonly STORAGE_KEY = 'inventory_movements';

  private getMovements(): InventoryMovement[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data, (key, value) => {
      if (key === 'date') return new Date(value);
      return value;
    }) : [];
  }

  private saveMovements(movements: InventoryMovement[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(movements));
  }

  async create(movementData: Omit<InventoryMovement, 'id' | 'date'>): Promise<InventoryMovement> {
    const movements = this.getMovements();
    const newMovement: InventoryMovement = {
      ...movementData,
      id: crypto.randomUUID(),
      date: new Date(),
    };
    movements.push(newMovement);
    this.saveMovements(movements);
    return newMovement;
  }

  async getAll(): Promise<InventoryMovement[]> {
    return this.getMovements();
  }

  async getByProductId(productId: string): Promise<InventoryMovement[]> {
    return this.getMovements().filter(m => m.productId === productId);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<InventoryMovement[]> {
    return this.getMovements().filter(m => 
      m.date >= startDate && m.date < endDate
    );
  }
}
