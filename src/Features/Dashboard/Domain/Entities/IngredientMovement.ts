export interface IngredientMovement {
  id: string;
  ingredientId: string;
  ingredientName: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  relatedSaleId?: string;
  date: Date;
  userId: string;
}
