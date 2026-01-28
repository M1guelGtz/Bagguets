import { CashRegister } from '../../Domain/Entities/CashRegister';
import { ICashRegisterRepository } from '../../Domain/Repository/ICashRegisterRepository';

export class LocalStorageCashRegisterRepository implements ICashRegisterRepository {
  private readonly STORAGE_KEY = 'cash_registers';

  private getRegisters(): CashRegister[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data, (key, value) => {
      if (key === 'openedAt' || key === 'closedAt') {
        return value ? new Date(value) : undefined;
      }
      return value;
    }) : [];
  }

  private saveRegisters(registers: CashRegister[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(registers));
  }

  async open(openingBalance: number, userId: string): Promise<CashRegister> {
    const registers = this.getRegisters();
    const newRegister: CashRegister = {
      id: crypto.randomUUID(),
      openedAt: new Date(),
      openingBalance,
      totalSales: 0,
      totalExpenses: 0,
      expectedBalance: openingBalance,
      status: 'OPEN',
      userId,
    };
    registers.push(newRegister);
    this.saveRegisters(registers);
    return newRegister;
  }

  async close(id: string, actualBalance: number, notes?: string): Promise<CashRegister> {
    const registers = this.getRegisters();
    const index = registers.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Caja no encontrada');
    
    const register = registers[index];
    const expectedBalance = register.openingBalance + register.totalSales - register.totalExpenses;
    
    registers[index] = {
      ...register,
      closedAt: new Date(),
      closingBalance: actualBalance,
      actualBalance,
      expectedBalance,
      difference: actualBalance - expectedBalance,
      status: 'CLOSED',
      notes,
    };
    
    this.saveRegisters(registers);
    return registers[index];
  }

  async getCurrent(): Promise<CashRegister | null> {
    const registers = this.getRegisters();
    return registers.find(r => r.status === 'OPEN') || null;
  }

  async getById(id: string): Promise<CashRegister | null> {
    return this.getRegisters().find(r => r.id === id) || null;
  }

  async getAll(): Promise<CashRegister[]> {
    return this.getRegisters();
  }

  async updateTotals(id: string, sales: number, expenses: number): Promise<void> {
    const registers = this.getRegisters();
    const index = registers.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Caja no encontrada');
    
    registers[index].totalSales = sales;
    registers[index].totalExpenses = expenses;
    registers[index].expectedBalance = registers[index].openingBalance + sales - expenses;
    
    this.saveRegisters(registers);
  }
}
