export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number;
  reason: string;
  date: Date;
  userId: string;
}
