import { Promotion } from '../Entities/Promotion';

export interface IPromotionRepository {
  create(promotion: Promotion): Promise<Promotion>;
  getAll(): Promise<Promotion[]>;
  getActive(): Promise<Promotion[]>;
  getByProductId(productId: string): Promise<Promotion[]>;
  getById(id: string): Promise<Promotion | null>;
  update(promotion: Promotion): Promise<Promotion>;
  delete(id: string): Promise<void>;
}
