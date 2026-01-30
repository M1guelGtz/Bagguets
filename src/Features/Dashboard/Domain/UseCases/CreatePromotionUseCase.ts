import { Promotion, PromotionProduct } from '../Entities/Promotion';
import { IProductRepository } from '../Repository/IProductRepository';
import { IPromotionRepository } from '../Repository/IPromotionRepository';

export class CreatePromotionUseCase {
  constructor(
    private promotionRepository: IPromotionRepository,
    private productRepository: IProductRepository
  ) {}

  async execute(data: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'>): Promise<Promotion> {
    // Validaciones
    if (!data.name || data.name.trim() === '') {
      throw new Error('El nombre de la promoción es requerido');
    }

    if (!data.products || data.products.length === 0) {
      throw new Error('Debe agregar al menos un producto a la promoción');
    }

    // Validar que todos los productos existan
    const validatedProducts: PromotionProduct[] = [];
    let totalRegularPrice = 0;
    
    for (const productData of data.products) {
      const product = await this.productRepository.getById(productData.productId);
      if (!product) {
        throw new Error(`Producto con ID ${productData.productId} no encontrado`);
      }
      
      if (productData.quantity <= 0) {
        throw new Error(`La cantidad del producto ${product.name} debe ser mayor a 0`);
      }
      
      validatedProducts.push({
        productId: product.id,
        productName: product.name,
        quantity: productData.quantity,
        unitPrice: product.price
      });
      
      totalRegularPrice += product.price * productData.quantity;
    }

    if (data.startDate >= data.endDate) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    // Validaciones según tipo de descuento
    if (data.discountType === 'PACKAGE_PRICE') {
      if (!data.packagePrice || data.packagePrice <= 0) {
        throw new Error('El precio del paquete debe ser mayor a 0');
      }
      if (data.packagePrice >= totalRegularPrice) {
        throw new Error(`El precio del paquete ($${data.packagePrice}) debe ser menor al precio regular ($${totalRegularPrice})`);
      }
    } else if (data.discountType === 'BUY_X_GET_Y') {
      if (!data.buyQuantity || data.buyQuantity <= 0) {
        throw new Error('Cantidad de compra requerida para promoción 2x1');
      }
      if (!data.getQuantity || data.getQuantity <= 0) {
        throw new Error('Cantidad de regalo requerida para promoción 2x1');
      }
    } else {
      if (data.discountValue <= 0) {
        throw new Error('El valor del descuento debe ser mayor a 0');
      }
    }

    // Mantener compatibilidad con campos antiguos
    const firstProduct = validatedProducts[0];
    const secondProduct = validatedProducts.length > 1 ? validatedProducts[1] : undefined;

    const promotion: Promotion = {
      ...data,
      id: crypto.randomUUID(),
      productId: firstProduct.productId,
      productName: firstProduct.productName,
      secondaryProductId: secondProduct?.productId,
      secondaryProductName: secondProduct?.productName,
      products: validatedProducts,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.promotionRepository.create(promotion);
  }
}
