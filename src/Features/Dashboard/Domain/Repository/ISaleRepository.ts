import { Sale } from '../Entities/Sale';

export interface ISaleRepository {
  create(sale: Omit<Sale, 'id' | 'date'>): Promise<Sale>;
  getAll(): Promise<Sale[]>;
  getById(id: string): Promise<Sale | null>;
  getByDateRange(startDate: Date, endDate: Date): Promise<Sale[]>;
  getTodaySales(): Promise<Sale[]>;
}
