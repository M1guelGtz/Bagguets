export interface CashRegisterHistory {
  id: string;
  openedAt: Date;
  closedAt: Date;
  openingBalance: number;
  closingBalance: number;
  totalSales: number;
  totalExpenses: number;
  expectedBalance: number;
  actualBalance: number;
  difference: number;
  userId: string;
  notes?: string;
  createdAt: Date;
}
