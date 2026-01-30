import { Sale, SaleItem } from '../Entities/Sale';
import { ICashRegisterRepository } from '../Repository/ICashRegisterRepository';
import { IProductIngredientRepository } from '../Repository/IProductIngredientRepository';
import { IProductRepository } from '../Repository/IProductRepository';
import { IPromotionRepository } from '../Repository/IPromotionRepository';
import { ISaleRepository } from '../Repository/ISaleRepository';
import { AssignWorkersToSaleUseCase } from './AssignWorkersToSaleUseCase';
import { CheckProductAvailabilityUseCase } from './CheckProductAvailabilityUseCase';
import { ConsumeIngredientsUseCase } from './ConsumeIngredientsUseCase';

export class CreateSaleUseCase {
  constructor(
    private saleRepository: ISaleRepository,
    private productRepository: IProductRepository,
    private cashRegisterRepository: ICashRegisterRepository,
    private productIngredientRepository: IProductIngredientRepository,
    private promotionRepository: IPromotionRepository,
    private consumeIngredientsUseCase: ConsumeIngredientsUseCase,
    private assignWorkersToSaleUseCase: AssignWorkersToSaleUseCase,
    private checkProductAvailabilityUseCase: CheckProductAvailabilityUseCase
  ) {}

  async execute(
    items: Array<{ productId: string; quantity: number; promotionId?: string }>,
    paymentMethod: 'CASH' | 'CARD' | 'TRANSFER',
    userId: string,
    cookId?: string,
    deliveryId?: string,
    notes?: string
  ): Promise<Sale> {
    if (items.length === 0) {
      throw new Error('La venta debe tener al menos un producto');
    }

    // Verificar que hay una caja abierta
    const cashRegister = await this.cashRegisterRepository.getCurrent();
    if (!cashRegister) {
      throw new Error('No hay una caja abierta. Por favor, abre la caja primero.');
    }

    // Preparar los items de la venta
    const saleItems: SaleItem[] = [];
    let total = 0;

    // Detectar si hay un paquete completo
    const itemsWithPromotions = items
      .filter(item => item.promotionId)
      .map(item => ({
        item,
        promotion: null as any
      }));

    for (const itemWithPromo of itemsWithPromotions) {
      const promotion = await this.promotionRepository.getById(itemWithPromo.item.promotionId!);
      itemWithPromo.promotion = promotion;
    }

    // Verificar si hay un paquete completo
    let packageApplied = false;
    let packagePromotion: any = null;

    for (const itemWithPromo of itemsWithPromotions) {
      const promotion = itemWithPromo.promotion;
      if (promotion?.discountType === 'PACKAGE_PRICE' && promotion.products) {
        // Verificar si todos los productos del paquete están presentes con cantidades correctas
        const allProductsPresent = promotion.products.every(promoProduct => {
          const saleItem = items.find(
            item => item.productId === promoProduct.productId
          );
          return saleItem && saleItem.quantity >= promoProduct.quantity;
        });

        if (allProductsPresent) {
          packageApplied = true;
          packagePromotion = promotion;
          total = promotion.packagePrice || 0;
          break;
        }
      }
    }

    // Si hay paquete completo, procesar diferente
    if (packageApplied && packagePromotion) {
      const packageProductIds = packagePromotion.products.map((p: any) => p.productId);

      // Primero agregar los productos del paquete
      for (const promoProduct of packagePromotion.products) {
        const product = await this.productRepository.getById(promoProduct.productId);
        if (!product) {
          throw new Error(`Producto con ID ${promoProduct.productId} no encontrado`);
        }

        const canPrepare = await this.checkProductAvailabilityUseCase.canPrepare(
          promoProduct.productId,
          promoProduct.quantity
        );

        if (!canPrepare.canPrepare) {
          throw new Error(`No se puede preparar ${product.name}: ${canPrepare.reason}`);
        }

        // Calcular precio proporcional del producto en el paquete
        const totalRegularPrice = packagePromotion.products.reduce(
          (sum: number, p: any) => sum + (p.unitPrice * p.quantity),
          0
        );
        const productRegularTotal = promoProduct.unitPrice * promoProduct.quantity;
        const proportion = productRegularTotal / totalRegularPrice;
        const productPromoTotal = packagePromotion.packagePrice * proportion;
        const itemPrice = productPromoTotal / promoProduct.quantity;

        saleItems.push({
          productId: product.id,
          productName: product.name + ` (${packagePromotion.name})`,
          quantity: promoProduct.quantity,
          price: itemPrice,
          subtotal: itemPrice * promoProduct.quantity,
        });
      }

      // Luego agregar los productos adicionales fuera del paquete
      for (const item of items) {
        if (!packageProductIds.includes(item.productId)) {
          const product = await this.productRepository.getById(item.productId);
          if (!product) {
            throw new Error(`Producto con ID ${item.productId} no encontrado`);
          }

          const canPrepare = await this.checkProductAvailabilityUseCase.canPrepare(
            item.productId,
            item.quantity
          );

          if (!canPrepare.canPrepare) {
            throw new Error(`No se puede preparar ${product.name}: ${canPrepare.reason}`);
          }

          const subtotal = product.price * item.quantity;
          saleItems.push({
            productId: product.id,
            productName: product.name,
            quantity: item.quantity,
            price: product.price,
            subtotal,
          });

          total += subtotal;
        }
      }
    } else {
      // Si no hay paquete completo, procesar normalmente
      for (const item of items) {
        const product = await this.productRepository.getById(item.productId);
        if (!product) {
          throw new Error(`Producto con ID ${item.productId} no encontrado`);
        }

        // Verificar disponibilidad basada en insumos
        const canPrepare = await this.checkProductAvailabilityUseCase.canPrepare(
          item.productId,
          item.quantity
        );
        
        if (!canPrepare.canPrepare) {
          throw new Error(`No se puede preparar ${product.name}: ${canPrepare.reason}`);
        }

        let itemPrice = product.price;
        let promotionName = '';
        
        // Aplicar descuento de promoción si existe
        if (item.promotionId) {
          const promotion = await this.promotionRepository.getById(item.promotionId);
          // Verificar que la promoción sea válida para este producto
          const isValidForProduct = promotion && promotion.active && (
            promotion.productId === product.id || 
            promotion.secondaryProductId === product.id ||
            (promotion.products && promotion.products.some(p => p.productId === product.id))
          );
          
          if (isValidForProduct) {
            const now = new Date();
            const startDate = new Date(promotion.startDate);
            const endDate = new Date(promotion.endDate);
            
            if (startDate <= now && endDate >= now) {
              promotionName = ` (${promotion.name})`;
              
              if (promotion.discountType === 'PACKAGE_PRICE' && promotion.packagePrice && promotion.products) {
                // Para paquetes parciales: distribuir el precio proporcionalmente
                const totalRegularPrice = promotion.products.reduce(
                  (sum, p) => sum + (p.unitPrice * p.quantity), 
                  0
                );
                const productInPromo = promotion.products.find(p => p.productId === product.id);
                if (productInPromo) {
                  // Calcular precio proporcional del producto en el paquete
                  const productRegularTotal = productInPromo.unitPrice * productInPromo.quantity;
                  const proportion = productRegularTotal / totalRegularPrice;
                  const productPromoTotal = promotion.packagePrice * proportion;
                  itemPrice = productPromoTotal / productInPromo.quantity;
                }
              } else if (promotion.discountType === 'PERCENTAGE') {
                itemPrice = product.price * (1 - promotion.discountValue / 100);
              } else if (promotion.discountType === 'FIXED_AMOUNT') {
                itemPrice = Math.max(0, product.price - promotion.discountValue);
              } else if (promotion.discountType === 'BUY_X_GET_Y' && promotion.buyQuantity && promotion.getQuantity) {
                // Para 2x1: si compra 2, paga 1 (cobrar solo buyQuantity - getQuantity unidades por cada set)
                const setsCount = Math.floor(item.quantity / promotion.buyQuantity);
                const chargeableUnits = item.quantity - (setsCount * promotion.getQuantity);
                const totalForPromo = product.price * chargeableUnits;
                itemPrice = totalForPromo / item.quantity; // Precio promedio por unidad
              }
            }
          }
        }

        const subtotal = itemPrice * item.quantity;
        saleItems.push({
          productId: product.id,
          productName: product.name + promotionName,
          quantity: item.quantity,
          price: itemPrice,
          subtotal,
        });

        total += subtotal;
      }
    }

    // Crear la venta
    const sale = await this.saleRepository.create({
      items: saleItems,
      total,
      paymentMethod,
      userId,
      cookId,
      deliveryId,
      notes,
    });

    // Asignar trabajadores a la venta y calcular sus pagos
    if (cookId || deliveryId) {
      // Calcular el total de productos vendidos
      const productCount = saleItems.reduce((sum, item) => sum + item.quantity, 0);
      
      await this.assignWorkersToSaleUseCase.execute(sale.id, {
        cookId,
        deliveryId,
        productCount,
      });
    }

    // Descontar insumos por cada producto vendido
    for (const item of items) {
      const productIngredients = await this.productIngredientRepository.getByProductId(
        item.productId
      );

      if (productIngredients.length > 0) {
        const ingredientsToConsume = productIngredients.map((pi) => ({
          ingredientId: pi.ingredientId,
          quantity: pi.quantity * item.quantity, // cantidad de insumo * unidades vendidas
        }));

        await this.consumeIngredientsUseCase.execute(ingredientsToConsume, sale.id, userId);
      }
    }

    // Actualizar totales de caja
    await this.cashRegisterRepository.updateTotals(
      cashRegister.id,
      cashRegister.totalSales + total,
      cashRegister.totalExpenses
    );

    return sale;
  }
}
