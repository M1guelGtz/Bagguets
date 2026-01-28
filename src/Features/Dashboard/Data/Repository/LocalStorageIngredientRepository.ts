import { Ingredient } from '../../Domain/Entities/Ingredient';
import { IIngredientRepository } from '../../Domain/Repository/IIngredientRepository';

export class LocalStorageIngredientRepository implements IIngredientRepository {
  private readonly STORAGE_KEY = 'ingredients';

  private getIngredients(): Ingredient[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data
      ? JSON.parse(data, (key, value) => {
          if (key === 'createdAt' || key === 'updatedAt') return new Date(value);
          return value;
        })
      : [];
  }

  private saveIngredients(ingredients: Ingredient[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ingredients));
  }

  async create(ingredientData: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ingredient> {
    const ingredients = this.getIngredients();
    const newIngredient: Ingredient = {
      ...ingredientData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    ingredients.push(newIngredient);
    this.saveIngredients(ingredients);
    return newIngredient;
  }

  async update(id: string, ingredientData: Partial<Ingredient>): Promise<Ingredient> {
    const ingredients = this.getIngredients();
    const index = ingredients.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Insumo no encontrado');

    ingredients[index] = {
      ...ingredients[index],
      ...ingredientData,
      updatedAt: new Date(),
    };
    this.saveIngredients(ingredients);
    return ingredients[index];
  }

  async delete(id: string): Promise<void> {
    const ingredients = this.getIngredients().filter((i) => i.id !== id);
    this.saveIngredients(ingredients);
  }

  async getById(id: string): Promise<Ingredient | null> {
    const ingredients = this.getIngredients();
    return ingredients.find((i) => i.id === id) || null;
  }

  async getAll(): Promise<Ingredient[]> {
    return this.getIngredients();
  }

  async updateStock(id: string, quantity: number): Promise<void> {
    const ingredients = this.getIngredients();
    const index = ingredients.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Insumo no encontrado');

    ingredients[index].stock += quantity;
    ingredients[index].updatedAt = new Date();
    this.saveIngredients(ingredients);
  }
}
