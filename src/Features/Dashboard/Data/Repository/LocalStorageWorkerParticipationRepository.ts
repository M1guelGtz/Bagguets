import { WorkerParticipation } from '../../Domain/Entities/WorkerParticipation';
import { IWorkerParticipationRepository } from '../../Domain/Repository/IWorkerParticipationRepository';

export class LocalStorageWorkerParticipationRepository implements IWorkerParticipationRepository {
  private readonly STORAGE_KEY = 'worker_participations';

  async create(participation: WorkerParticipation): Promise<WorkerParticipation> {
    const participations = await this.getAll();
    participations.push(participation);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(participations));
    return participation;
  }

  async getAll(): Promise<WorkerParticipation[]> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data).map((p: WorkerParticipation) => ({
      ...p,
      date: new Date(p.date)
    }));
  }

  async getBySaleId(saleId: string): Promise<WorkerParticipation[]> {
    const participations = await this.getAll();
    return participations.filter(p => p.saleId === saleId);
  }

  async getByWorkerId(workerId: string): Promise<WorkerParticipation[]> {
    const participations = await this.getAll();
    return participations.filter(p => p.workerId === workerId);
  }

  async getUnpaid(workerId?: string): Promise<WorkerParticipation[]> {
    const participations = await this.getAll();
    let filtered = participations.filter(p => !p.paid);
    if (workerId) {
      filtered = filtered.filter(p => p.workerId === workerId);
    }
    return filtered;
  }

  async update(participation: WorkerParticipation): Promise<WorkerParticipation> {
    const participations = await this.getAll();
    const index = participations.findIndex(p => p.id === participation.id);
    if (index === -1) throw new Error('Participación no encontrada');
    
    participations[index] = participation;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(participations));
    return participation;
  }
}
