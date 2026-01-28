export interface Promotion {
  id: string;
  productId: string;
  productName: string;
  name: string; // Nombre de la promoción (ej: "2x1 Enero")
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y'; // Porcentaje, monto fijo, o compra X lleva Y
  discountValue: number; // Porcentaje (ej: 20 para 20%) o monto fijo
  buyQuantity?: number; // Para promociones 2x1, 3x2, etc.
  getQuantity?: number; // Para promociones 2x1 (compra 2, lleva 1 gratis)
  startDate: Date;
  endDate: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
