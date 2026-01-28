import { Worker } from '../Entities/Worker';

export interface IWorkerRepository {
  create(worker: Worker): Promise<Worker>;
  getAll(): Promise<Worker[]>;
  getActive(): Promise<Worker[]>;
  getById(id: string): Promise<Worker | null>;
  update(worker: Worker): Promise<Worker>;
  delete(id: string): Promise<void>;
}
