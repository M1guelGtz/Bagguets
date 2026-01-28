import { Promotion } from '../../Domain/Entities/Promotion';
import { IPromotionRepository } from '../../Domain/Repository/IPromotionRepository';

export class LocalStoragePromotionRepository implements IPromotionRepository {
  private readonly STORAGE_KEY = 'promotions';

  async create(promotion: Promotion): Promise<Promotion> {
    const promotions = await this.getAll();
    promotions.push(promotion);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(promotions));
    return promotion;
  }

  async getAll(): Promise<Promotion[]> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data).map((p: Promotion) => ({
      ...p,
      startDate: new Date(p.startDate),
      endDate: new Date(p.endDate),
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt)
    }));
  }

  async getActive(): Promise<Promotion[]> {
    const promotions = await this.getAll();
    const now = new Date();
    return promotions.filter(p => 
      p.active && 
      new Date(p.startDate) <= now && 
      new Date(p.endDate) >= now
    );
  }

  async getByProductId(productId: string): Promise<Promotion[]> {
    const promotions = await this.getAll();
    return promotions.filter(p => p.productId === productId);
  }

  async getById(id: string): Promise<Promotion | null> {
    const promotions = await this.getAll();
    return promotions.find(p => p.id === id) || null;
  }

  async update(promotion: Promotion): Promise<Promotion> {
    const promotions = await this.getAll();
    const index = promotions.findIndex(p => p.id === promotion.id);
    if (index === -1) throw new Error('Promoción no encontrada');
    
    promotions[index] = promotion;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(promotions));
    return promotion;
  }

  async delete(id: string): Promise<void> {
    const promotions = await this.getAll();
    const filtered = promotions.filter(p => p.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }
}
