export interface Ingredient {
  id: string;
  name: string;
  description: string;
  unit: string; // kg, L, piezas, etc.
  stock: number;
  minStock: number;
  cost: number; // costo por unidad
  createdAt: Date;
  updatedAt: Date;
}
