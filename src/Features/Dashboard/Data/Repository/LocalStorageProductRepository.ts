import { Product } from '../../Domain/Entities/Product';
import { IProductRepository } from '../../Domain/Repository/IProductRepository';

export class LocalStorageProductRepository implements IProductRepository {
  private readonly STORAGE_KEY = 'products';

  private getProducts(): Product[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveProducts(products: Product[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products));
  }

  async create(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const products = this.getProducts();
    const newProduct: Product = {
      ...productData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    products.push(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  async update(id: string, productData: Partial<Product>): Promise<Product> {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Producto no encontrado');
    
    products[index] = {
      ...products[index],
      ...productData,
      updatedAt: new Date(),
    };
    this.saveProducts(products);
    return products[index];
  }

  async delete(id: string): Promise<void> {
    const products = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(products);
  }

  async getById(id: string): Promise<Product | null> {
    const products = this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  async getAll(): Promise<Product[]> {
    return this.getProducts();
  }

  async updateStock(_id: string, _quantity: number): Promise<void> {
    // Stock is now calculated dynamically based on ingredient availability
    // This method is deprecated but kept for backwards compatibility
    return;
  }
}
