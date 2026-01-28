import { Expense } from '../../Domain/Entities/Expense';
import { IExpenseRepository } from '../../Domain/Repository/IExpenseRepository';

export class LocalStorageExpenseRepository implements IExpenseRepository {
  private readonly STORAGE_KEY = 'expenses';

  private getExpenses(): Expense[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data, (key, value) => {
      if (key === 'date') return new Date(value);
      return value;
    }) : [];
  }

  private saveExpenses(expenses: Expense[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(expenses));
  }

  async create(expenseData: Omit<Expense, 'id' | 'date'>): Promise<Expense> {
    const expenses = this.getExpenses();
    const newExpense: Expense = {
      ...expenseData,
      id: crypto.randomUUID(),
      date: new Date(),
    };
    expenses.push(newExpense);
    this.saveExpenses(expenses);
    return newExpense;
  }

  async getAll(): Promise<Expense[]> {
    return this.getExpenses();
  }

  async getById(id: string): Promise<Expense | null> {
    return this.getExpenses().find(e => e.id === id) || null;
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    return this.getExpenses().filter(e => 
      e.date >= startDate && e.date < endDate
    );
  }

  async getTodayExpenses(): Promise<Expense[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.getByDateRange(today, tomorrow);
  }

  async delete(id: string): Promise<void> {
    const expenses = this.getExpenses().filter(e => e.id !== id);
    this.saveExpenses(expenses);
  }
}
