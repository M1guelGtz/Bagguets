import { ISaleRepository } from '../Repository/ISaleRepository';

export interface SalesGrowth {
  today: number;
  yesterday: number;
  lastWeek: number;
  lastMonth: number;
  growthPercentage: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export class GetSalesGrowthUseCase {
  constructor(private saleRepository: ISaleRepository) {}

  async execute(): Promise<SalesGrowth> {
    const now = new Date();
    
    // Ventas de hoy
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    const todaySales = await this.saleRepository.getByDateRange(todayStart, todayEnd);
    const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);

    // Ventas de ayer
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayStart);
    const yesterdaySales = await this.saleRepository.getByDateRange(yesterdayStart, yesterdayEnd);
    const yesterdayTotal = yesterdaySales.reduce((sum, sale) => sum + sale.total, 0);

    // Ventas de la semana pasada
    const lastWeekStart = new Date(todayStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekSales = await this.saleRepository.getByDateRange(lastWeekStart, todayStart);
    const lastWeekTotal = lastWeekSales.reduce((sum, sale) => sum + sale.total, 0);

    // Ventas del mes pasado
    const lastMonthStart = new Date(todayStart);
    lastMonthStart.setDate(lastMonthStart.getDate() - 30);
    const lastMonthSales = await this.saleRepository.getByDateRange(lastMonthStart, todayStart);
    const lastMonthTotal = lastMonthSales.reduce((sum, sale) => sum + sale.total, 0);

    // Calcular porcentajes de crecimiento
    const dailyGrowth = yesterdayTotal > 0 
      ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100 
      : 0;
    
    const weeklyAvg = lastWeekTotal / 7;
    const weeklyGrowth = weeklyAvg > 0 
      ? ((todayTotal - weeklyAvg) / weeklyAvg) * 100 
      : 0;

    const monthlyAvg = lastMonthTotal / 30;
    const monthlyGrowth = monthlyAvg > 0 
      ? ((todayTotal - monthlyAvg) / monthlyAvg) * 100 
      : 0;

    return {
      today: todayTotal,
      yesterday: yesterdayTotal,
      lastWeek: lastWeekTotal,
      lastMonth: lastMonthTotal,
      growthPercentage: {
        daily: Math.round(dailyGrowth * 100) / 100,
        weekly: Math.round(weeklyGrowth * 100) / 100,
        monthly: Math.round(monthlyGrowth * 100) / 100,
      },
    };
  }
}
