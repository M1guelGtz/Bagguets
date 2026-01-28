export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  // Stock ahora se calcula basado en disponibilidad de insumos
  category: string;
  createdAt: Date;
  updatedAt: Date;
}
