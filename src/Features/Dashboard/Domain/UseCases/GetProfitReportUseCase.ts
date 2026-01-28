import { IExpenseRepository } from '../../Domain/Repository/IExpenseRepository';
import { IProductRepository } from '../../Domain/Repository/IProductRepository';
import { ISaleRepository } from '../../Domain/Repository/ISaleRepository';
import { IWorkerParticipationRepository } from '../../Domain/Repository/IWorkerParticipationRepository';

export interface ProfitReport {
  totalSales: number;
  productCosts: number; // Costo de productos vendidos
  ingredientCosts: number; // Estimado basado en los costos de productos
  workerPayments: number; // Pagos a trabajadores
  operatingExpenses: number; // Gastos operativos
  netProfit: number; // Ganancia neta
}

export class GetProfitReportUseCase {
  constructor(
    private saleRepository: ISaleRepository,
    private expenseRepository: IExpenseRepository,
    private workerParticipationRepository: IWorkerParticipationRepository,
    private productRepository: IProductRepository
  ) {}

  async execute(startDate: Date, endDate: Date): Promise<ProfitReport> {
    // Obtener ventas
    const sales = await this.saleRepository.getByDateRange(startDate, endDate);
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);

    // Calcular costos de productos vendidos
    const products = await this.productRepository.getAll();
    const productMap = new Map(products.map(p => [p.id, p]));

    let productCosts = 0;
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const product = productMap.get(item.productId);
        if (product && product.cost) {
          productCosts += product.cost * item.quantity;
        }
      });
    });

    // Estimación de costos de ingredientes (basado en el 70% del costo del producto)
    const ingredientCosts = productCosts * 0.7;

    // Obtener pagos a trabajadores
    const participations = await this.workerParticipationRepository.getAll();
    const filteredParticipations = participations.filter(p => {
      const date = new Date(p.date);
      return date >= startDate && date <= endDate;
    });
    const workerPayments = filteredParticipations.reduce((sum, p) => sum + p.payment, 0);

    // Obtener gastos operativos
    const expenses = await this.expenseRepository.getByDateRange(startDate, endDate);
    const operatingExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calcular ganancia neta
    const netProfit = totalSales - productCosts - workerPayments - operatingExpenses;

    return {
      totalSales,
      productCosts,
      ingredientCosts,
      workerPayments,
      operatingExpenses,
      netProfit
    };
  }
}
