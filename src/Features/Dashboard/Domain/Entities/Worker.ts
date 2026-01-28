export type WorkerRole = 'COCINERO' | 'REPARTIDOR' | 'COMPRADOR' | 'LOGISTICA';

export interface Worker {
  id: string;
  name: string;
  roles: WorkerRole[]; // Un trabajador puede tener múltiples roles
  paymentPerSale: number; // Pago por venta completada
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
