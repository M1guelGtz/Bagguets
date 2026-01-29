import { CashRegisterHistory } from '../../Domain/Entities/CashRegisterHistory';
import { ICashRegisterHistoryRepository } from '../../Domain/Repository/ICashRegisterHistoryRepository';

export class LocalStorageCashRegisterHistoryRepository implements ICashRegisterHistoryRepository {
  private readonly storageKey = 'cashRegisterHistory';

  private getHistory(): CashRegisterHistory[] {
    const data = localStorage.getItem(this.storageKey);
    if (!data) return [];
    
    try {
      const parsed = JSON.parse(data);
      return parsed.map((item: any) => ({
        ...item,
        openedAt: new Date(item.openedAt),
        closedAt: new Date(item.closedAt),
        createdAt: new Date(item.createdAt),
      }));
    } catch {
      return [];
    }
  }

  private saveHistory(history: CashRegisterHistory[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(history));
  }

  async create(data: Omit<CashRegisterHistory, 'id' | 'createdAt'>): Promise<CashRegisterHistory> {
    const id = `history_${Date.now()}`;
    const history = this.getHistory();
    
    const newRecord: CashRegisterHistory = {
      ...data,
      id,
      createdAt: new Date(),
    };

    history.push(newRecord);
    this.saveHistory(history);
    return newRecord;
  }

  async getAll(): Promise<CashRegisterHistory[]> {
    return this.getHistory().sort((a, b) => 
      new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime()
    );
  }

  async getByUserId(userId: string): Promise<CashRegisterHistory[]> {
    return this.getHistory()
      .filter(h => h.userId === userId)
      .sort((a, b) => 
        new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime()
      );
  }

  async getById(id: string): Promise<CashRegisterHistory | null> {
    return this.getHistory().find(h => h.id === id) || null;
  }
}
