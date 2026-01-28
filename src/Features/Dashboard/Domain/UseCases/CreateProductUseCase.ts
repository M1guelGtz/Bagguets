import { Product } from '../Entities/Product';
import { IProductRepository } from '../Repository/IProductRepository';

export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    if (!productData.name || productData.name.trim() === '') {
      throw new Error('El nombre del producto es requerido');
    }
    if (productData.price <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }
    if (productData.cost < 0) {
      throw new Error('El costo no puede ser negativo');
    }
    return await this.productRepository.create(productData);
  }
}
