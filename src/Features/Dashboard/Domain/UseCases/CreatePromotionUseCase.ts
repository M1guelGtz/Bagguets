import { Promotion } from '../Entities/Promotion';
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

    if (!data.productId) {
      throw new Error('Debe seleccionar un producto');
    }

    const product = await this.productRepository.getById(data.productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    if (data.startDate >= data.endDate) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    if (data.discountType === 'BUY_X_GET_Y') {
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

    const promotion: Promotion = {
      ...data,
      id: crypto.randomUUID(),
      productName: product.name,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.promotionRepository.create(promotion);
  }
}
