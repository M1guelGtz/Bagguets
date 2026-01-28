export interface WorkerPayment {
  id: string;
  workerId: string;
  workerName: string;
  amount: number;
  participationIds: string[]; // IDs de las participaciones que se están pagando
  date: Date;
  notes?: string;
  userId: string;
}
