import { CashRegister } from '../Entities/CashRegister';

export interface ICashRegisterRepository {
  open(openingBalance: number, userId: string): Promise<CashRegister>;
  close(id: string, actualBalance: number, notes?: string): Promise<CashRegister>;
  getCurrent(): Promise<CashRegister | null>;
  getById(id: string): Promise<CashRegister | null>;
  getAll(): Promise<CashRegister[]>;
  updateTotals(id: string, sales: number, expenses: number): Promise<void>;
}
