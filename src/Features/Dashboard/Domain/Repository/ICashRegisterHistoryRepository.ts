import { CashRegisterHistory } from '../Entities/CashRegisterHistory';

export interface ICashRegisterHistoryRepository {
  create(data: Omit<CashRegisterHistory, 'id' | 'createdAt'>): Promise<CashRegisterHistory>;
  getAll(): Promise<CashRegisterHistory[]>;
  getByUserId(userId: string): Promise<CashRegisterHistory[]>;
  getById(id: string): Promise<CashRegisterHistory | null>;
}
