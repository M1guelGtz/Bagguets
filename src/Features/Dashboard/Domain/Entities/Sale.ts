export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  date: Date;
  items: SaleItem[];
  total: number;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER';
  cookId?: string; // ID del cocinero
  cookName?: string;
  deliveryId?: string; // ID del repartidor
  deliveryName?: string;
  userId: string;
  notes?: string;
}
