import { IIngredientRepository } from '../Repository/IIngredientRepository';
import { IProductIngredientRepository } from '../Repository/IProductIngredientRepository';
import { IProductRepository } from '../Repository/IProductRepository';

export interface ProductAvailability {
  productId: string;
  productName: string;
  available: boolean;
  maxQuantity: number; // Cantidad máxima que se puede preparar
  missingIngredients: string[]; // Nombres de ingredientes faltantes
}

export class CheckProductAvailabilityUseCase {
  constructor(
    private productRepository: IProductRepository,
    private ingredientRepository: IIngredientRepository,
    private productIngredientRepository: IProductIngredientRepository
  ) {}

  async execute(productId?: string): Promise<ProductAvailability[]> {
    const products = productId 
      ? [await this.productRepository.getById(productId)].filter(Boolean)
      : await this.productRepository.getAll();

    const availabilities: ProductAvailability[] = [];

    for (const product of products) {
      if (!product) continue;

      const productIngredients = await this.productIngredientRepository.getByProductId(product.id);
      
      if (productIngredients.length === 0) {
        // Si no tiene ingredientes definidos, está disponible (producto sin receta)
        availabilities.push({
          productId: product.id,
          productName: product.name,
          available: true,
          maxQuantity: 999,
          missingIngredients: []
        });
        continue;
      }

      const missingIngredients: string[] = [];
      let maxQuantity = Infinity;

      for (const pi of productIngredients) {
        const ingredient = await this.ingredientRepository.getById(pi.ingredientId);
        
        if (!ingredient) {
          missingIngredients.push(pi.ingredientName);
          maxQuantity = 0;
          continue;
        }

        if (ingredient.stock < pi.quantity) {
          missingIngredients.push(ingredient.name);
          maxQuantity = 0;
        } else {
          // Calcular cuántas unidades se pueden hacer con este ingrediente
          const possibleQuantity = Math.floor(ingredient.stock / pi.quantity);
          maxQuantity = Math.min(maxQuantity, possibleQuantity);
        }
      }

      availabilities.push({
        productId: product.id,
        productName: product.name,
        available: missingIngredients.length === 0 && maxQuantity > 0,
        maxQuantity: maxQuantity === Infinity ? 999 : maxQuantity,
        missingIngredients
      });
    }

    return availabilities;
  }

  // Verificar si se puede preparar una cantidad específica
  async canPrepare(productId: string, quantity: number): Promise<{ canPrepare: boolean; reason?: string }> {
    const [availability] = await this.execute(productId);
    
    if (!availability) {
      return { canPrepare: false, reason: 'Producto no encontrado' };
    }

    if (!availability.available) {
      return { 
        canPrepare: false, 
        reason: `Ingredientes faltantes: ${availability.missingIngredients.join(', ')}` 
      };
    }

    if (availability.maxQuantity < quantity) {
      return { 
        canPrepare: false, 
        reason: `Solo se pueden preparar ${availability.maxQuantity} unidades` 
      };
    }

    return { canPrepare: true };
  }
}
