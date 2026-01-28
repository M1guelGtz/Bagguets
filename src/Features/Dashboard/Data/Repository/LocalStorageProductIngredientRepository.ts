import { ProductIngredient } from '../../Domain/Entities/ProductIngredient';
import { IProductIngredientRepository } from '../../Domain/Repository/IProductIngredientRepository';

export class LocalStorageProductIngredientRepository implements IProductIngredientRepository {
  private readonly STORAGE_KEY = 'product_ingredients';

  private getProductIngredients(): ProductIngredient[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data
      ? JSON.parse(data, (key, value) => {
          if (key === 'createdAt' || key === 'updatedAt') return new Date(value);
          return value;
        })
      : [];
  }

  private saveProductIngredients(items: ProductIngredient[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }

  async create(
    productIngredientData: Omit<ProductIngredient, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ProductIngredient> {
    const items = this.getProductIngredients();
    const newItem: ProductIngredient = {
      ...productIngredientData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    items.push(newItem);
    this.saveProductIngredients(items);
    return newItem;
  }

  async update(
    id: string,
    productIngredientData: Partial<ProductIngredient>
  ): Promise<ProductIngredient> {
    const items = this.getProductIngredients();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Relación producto-insumo no encontrada');

    items[index] = {
      ...items[index],
      ...productIngredientData,
      updatedAt: new Date(),
    };
    this.saveProductIngredients(items);
    return items[index];
  }

  async delete(id: string): Promise<void> {
    const items = this.getProductIngredients().filter((i) => i.id !== id);
    this.saveProductIngredients(items);
  }

  async getById(id: string): Promise<ProductIngredient | null> {
    return this.getProductIngredients().find((i) => i.id === id) || null;
  }

  async getByProductId(productId: string): Promise<ProductIngredient[]> {
    return this.getProductIngredients().filter((i) => i.productId === productId);
  }

  async getAll(): Promise<ProductIngredient[]> {
    return this.getProductIngredients();
  }

  async deleteByProductAndIngredient(productId: string, ingredientId: string): Promise<void> {
    const items = this.getProductIngredients().filter(
      (i) => !(i.productId === productId && i.ingredientId === ingredientId)
    );
    this.saveProductIngredients(items);
  }
}
