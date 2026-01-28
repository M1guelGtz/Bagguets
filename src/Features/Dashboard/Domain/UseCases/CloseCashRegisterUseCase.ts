import { CashRegister } from '../Entities/CashRegister';
import { ICashRegisterRepository } from '../Repository/ICashRegisterRepository';

export class CloseCashRegisterUseCase {
  constructor(private cashRegisterRepository: ICashRegisterRepository) {}

  async execute(actualBalance: number, notes?: string): Promise<CashRegister> {
    const currentRegister = await this.cashRegisterRepository.getCurrent();
    if (!currentRegister) {
      throw new Error('No hay una caja abierta para cerrar');
    }

    if (actualBalance < 0) {
      throw new Error('El balance final no puede ser negativo');
    }

    return await this.cashRegisterRepository.close(currentRegister.id, actualBalance, notes);
  }
}
