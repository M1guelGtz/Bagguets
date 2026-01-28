import { ProductIngredient } from '../Entities/ProductIngredient';
import { IIngredientRepository } from '../Repository/IIngredientRepository';
import { IProductIngredientRepository } from '../Repository/IProductIngredientRepository';
import { IProductRepository } from '../Repository/IProductRepository';

export class LinkIngredientToProductUseCase {
  constructor(
    private productIngredientRepository: IProductIngredientRepository,
    private productRepository: IProductRepository,
    private ingredientRepository: IIngredientRepository
  ) {}

  async execute(
    productId: string,
    ingredientId: string,
    quantity: number
  ): Promise<ProductIngredient> {
    const product = await this.productRepository.getById(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    const ingredient = await this.ingredientRepository.getById(ingredientId);
    if (!ingredient) {
      throw new Error('Insumo no encontrado');
    }

    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    return await this.productIngredientRepository.create({
      productId,
      ingredientId,
      ingredientName: ingredient.name,
      quantity,
      unit: ingredient.unit,
    });
  }
}
