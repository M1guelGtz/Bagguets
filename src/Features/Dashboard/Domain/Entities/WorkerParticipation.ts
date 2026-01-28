export interface WorkerParticipation {
  id: string;
  saleId: string;
  workerId: string;
  workerName: string;
  role: 'COCINERO' | 'REPARTIDOR';
  payment: number; // Monto que le corresponde por esta venta
  paid: boolean;
  date: Date;
}
