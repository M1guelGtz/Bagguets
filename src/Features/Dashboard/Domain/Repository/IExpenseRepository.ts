import { Expense } from '../Entities/Expense';

export interface IExpenseRepository {
  create(expense: Omit<Expense, 'id' | 'date'>): Promise<Expense>;
  getAll(): Promise<Expense[]>;
  getById(id: string): Promise<Expense | null>;
  getByDateRange(startDate: Date, endDate: Date): Promise<Expense[]>;
  getTodayExpenses(): Promise<Expense[]>;
  delete(id: string): Promise<void>;
}
