import { CashRegister } from '../Entities/CashRegister';
import { ICashRegisterRepository } from '../Repository/ICashRegisterRepository';

export class OpenCashRegisterUseCase {
  constructor(private cashRegisterRepository: ICashRegisterRepository) {}

  async execute(openingBalance: number, userId: string): Promise<CashRegister> {
    const currentRegister = await this.cashRegisterRepository.getCurrent();
    if (currentRegister) {
      throw new Error('Ya existe una caja abierta. Por favor, cierra la caja actual primero.');
    }

    if (openingBalance < 0) {
      throw new Error('El balance inicial no puede ser negativo');
    }

    return await this.cashRegisterRepository.open(openingBalance, userId);
  }
}
