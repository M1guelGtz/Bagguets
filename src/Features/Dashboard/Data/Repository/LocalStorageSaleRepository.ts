import { Sale } from '../../Domain/Entities/Sale';
import { ISaleRepository } from '../../Domain/Repository/ISaleRepository';

export class LocalStorageSaleRepository implements ISaleRepository {
  private readonly STORAGE_KEY = 'sales';

  private getSales(): Sale[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data, (key, value) => {
      if (key === 'date') return new Date(value);
      return value;
    }) : [];
  }

  private saveSales(sales: Sale[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sales));
  }

  async create(saleData: Omit<Sale, 'id' | 'date'>): Promise<Sale> {
    const sales = this.getSales();
    const newSale: Sale = {
      ...saleData,
      id: crypto.randomUUID(),
      date: new Date(),
    };
    sales.push(newSale);
    this.saveSales(sales);
    return newSale;
  }

  async getAll(): Promise<Sale[]> {
    return this.getSales();
  }

  async getById(id: string): Promise<Sale | null> {
    return this.getSales().find(s => s.id === id) || null;
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    return this.getSales().filter(s => 
      s.date >= startDate && s.date < endDate
    );
  }

  async getTodaySales(): Promise<Sale[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.getByDateRange(today, tomorrow);
  }
}
