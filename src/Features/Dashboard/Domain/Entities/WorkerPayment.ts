export interface WorkerPayment {
  id: string;
  workerId: string;
  workerName: string;
  amount: number;
  participationIds: string[]; // IDs de las participaciones que se están pagando
  date: Date;
  notes?: string;
  userId: string;
  paymentType: 'PARTICIPATION' | 'MANUAL'; // Tipo de pago: por participación o manual
  reason?: string; // Razón del pago manual (tarea extra, adelanto, etc)
}

