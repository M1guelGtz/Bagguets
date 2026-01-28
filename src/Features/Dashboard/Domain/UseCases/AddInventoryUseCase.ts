import { InventoryMovement, MovementType } from '../Entities/InventoryMovement';
import { IInventoryRepository } from '../Repository/IInventoryRepository';
import { IProductRepository } from '../Repository/IProductRepository';

export class AddInventoryUseCase {
  constructor(
    private inventoryRepository: IInventoryRepository,
    private productRepository: IProductRepository
  ) {}

  async execute(
    productId: string,
    quantity: number,
    type: MovementType,
    reason: string,
    userId: string
  ): Promise<InventoryMovement> {
    const product = await this.productRepository.getById(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    // Actualizar el stock del producto
    const stockChange = type === 'IN' ? quantity : type === 'OUT' ? -quantity : 0;
    await this.productRepository.updateStock(productId, stockChange);

    // Crear el movimiento de inventario
    const movement = await this.inventoryRepository.create({
      productId,
      productName: product.name,
      type,
      quantity,
      reason,
      userId,
    });

    return movement;
  }
}
