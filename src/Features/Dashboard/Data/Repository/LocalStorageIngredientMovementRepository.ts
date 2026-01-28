import { IngredientMovement } from '../../Domain/Entities/IngredientMovement';
import { IIngredientMovementRepository } from '../../Domain/Repository/IIngredientMovementRepository';

export class LocalStorageIngredientMovementRepository implements IIngredientMovementRepository {
  private readonly STORAGE_KEY = 'ingredient_movements';

  private getMovements(): IngredientMovement[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data
      ? JSON.parse(data, (key, value) => {
          if (key === 'date') return new Date(value);
          return value;
        })
      : [];
  }

  private saveMovements(movements: IngredientMovement[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(movements));
  }

  async create(movementData: Omit<IngredientMovement, 'id' | 'date'>): Promise<IngredientMovement> {
    const movements = this.getMovements();
    const newMovement: IngredientMovement = {
      ...movementData,
      id: crypto.randomUUID(),
      date: new Date(),
    };
    movements.push(newMovement);
    this.saveMovements(movements);
    return newMovement;
  }

  async getAll(): Promise<IngredientMovement[]> {
    return this.getMovements();
  }

  async getByIngredientId(ingredientId: string): Promise<IngredientMovement[]> {
    return this.getMovements().filter((m) => m.ingredientId === ingredientId);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<IngredientMovement[]> {
    return this.getMovements().filter((m) => m.date >= startDate && m.date < endDate);
  }
}
