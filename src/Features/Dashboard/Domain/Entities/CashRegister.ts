export interface CashRegister {
  id: string;
  openedAt: Date;
  closedAt?: Date;
  openingBalance: number;
  closingBalance?: number;
  totalSales: number;
  totalExpenses: number;
  expectedBalance: number;
  actualBalance?: number;
  difference?: number;
  status: 'OPEN' | 'CLOSED';
  userId: string;
  notes?: string;
}
