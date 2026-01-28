export interface ProductIngredient {
  id: string;
  productId: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number; // cantidad de insumo por unidad de producto
  unit: string; // unidad del insumo
  createdAt: Date;
  updatedAt: Date;
}
