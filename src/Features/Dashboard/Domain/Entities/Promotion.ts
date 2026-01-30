export interface PromotionProduct {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Promotion {
  id: string;
  productId: string; // Se mantiene por compatibilidad, pero será el primer producto
  productName: string; // Se mantiene por compatibilidad
  secondaryProductId?: string; // Se mantiene por compatibilidad
  secondaryProductName?: string; // Se mantiene por compatibilidad
  products: PromotionProduct[]; // Array de productos con cantidades
  name: string; // Nombre de la promoción (ej: "2x1 Enero")
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y' | 'PACKAGE_PRICE'; // Agregamos PACKAGE_PRICE
  discountValue: number; // Porcentaje (ej: 20 para 20%) o monto fijo
  packagePrice?: number; // Precio total del paquete (para tipo PACKAGE_PRICE)
  buyQuantity?: number; // Para promociones 2x1, 3x2, etc.
  getQuantity?: number; // Para promociones 2x1 (compra 2, lleva 1 gratis)
  startDate: Date;
  endDate: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
