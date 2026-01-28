import { Worker } from '../../Domain/Entities/Worker';
import { IWorkerRepository } from '../../Domain/Repository/IWorkerRepository';

export class LocalStorageWorkerRepository implements IWorkerRepository {
  private readonly STORAGE_KEY = 'workers';

  async create(worker: Worker): Promise<Worker> {
    const workers = await this.getAll();
    workers.push(worker);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workers));
    return worker;
  }

  async getAll(): Promise<Worker[]> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data).map((w: Worker) => ({
      ...w,
      createdAt: new Date(w.createdAt),
      updatedAt: new Date(w.updatedAt)
    }));
  }

  async getActive(): Promise<Worker[]> {
    const workers = await this.getAll();
    return workers.filter(w => w.active);
  }

  async getById(id: string): Promise<Worker | null> {
    const workers = await this.getAll();
    return workers.find(w => w.id === id) || null;
  }

  async update(worker: Worker): Promise<Worker> {
    const workers = await this.getAll();
    const index = workers.findIndex(w => w.id === worker.id);
    if (index === -1) throw new Error('Trabajador no encontrado');
    
    workers[index] = worker;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workers));
    return worker;
  }

  async delete(id: string): Promise<void> {
    const workers = await this.getAll();
    const filtered = workers.filter(w => w.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }
}
