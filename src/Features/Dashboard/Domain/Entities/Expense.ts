export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'SUPPLIES' | 'SERVICES' | 'SALARIES' | 'RENT' | 'UTILITIES' | 'OTHER';
  date: Date;
  cashRegisterId?: string;
  userId: string;
  notes?: string;
}
