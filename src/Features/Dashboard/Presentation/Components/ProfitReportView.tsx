import { ProfitReport } from '../../Domain/UseCases/GetProfitReportUseCase';
import './ProfitReportView.css';

interface ProfitReportViewProps {
  report: ProfitReport;
  dateRange: { start: Date; end: Date };
}

export const ProfitReportView = ({ report, dateRange }: ProfitReportViewProps) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const profitPercentage = report.totalSales > 0 
    ? ((report.netProfit / report.totalSales) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="profit-report-view">
      <div className="report-header">
        <h3>Reporte de Ganancias del Negocio</h3>
        <p className="date-range">
          {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
        </p>
      </div>

      <div className="profit-cards">
        <div className="profit-card total-sales">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <div className="card-label">Ventas Totales</div>
            <div className="card-value">${report.totalSales.toFixed(2)}</div>
          </div>
        </div>

        <div className="profit-card net-profit">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <div className="card-label">Ganancia Neta</div>
            <div className="card-value">${report.netProfit.toFixed(2)}</div>
            <div className="card-percentage">{profitPercentage}% de las ventas</div>
          </div>
        </div>
      </div>

      <div className="costs-breakdown">
        <h4>Desglose de Costos</h4>
        
        <div className="cost-items">
          <div className="cost-item">
            <div className="cost-bar-container">
              <div 
                className="cost-bar product-costs" 
                style={{ width: `${(report.productCosts / report.totalSales) * 100}%` }}
              />
            </div>
            <div className="cost-details">
              <span className="cost-label">Costo de Productos</span>
              <span className="cost-amount">${report.productCosts.toFixed(2)}</span>
            </div>
          </div>

          <div className="cost-item">
            <div className="cost-bar-container">
              <div 
                className="cost-bar worker-payments" 
                style={{ width: `${(report.workerPayments / report.totalSales) * 100}%` }}
              />
            </div>
            <div className="cost-details">
              <span className="cost-label">Pagos a Trabajadores</span>
              <span className="cost-amount">${report.workerPayments.toFixed(2)}</span>
            </div>
          </div>

          <div className="cost-item">
            <div className="cost-bar-container">
              <div 
                className="cost-bar operating-expenses" 
                style={{ width: `${(report.operatingExpenses / report.totalSales) * 100}%` }}
              />
            </div>
            <div className="cost-details">
              <span className="cost-label">Gastos Operativos</span>
              <span className="cost-amount">${report.operatingExpenses.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="total-costs">
          <span className="total-label">Total de Costos:</span>
          <span className="total-amount">
            ${(report.productCosts + report.workerPayments + report.operatingExpenses).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="profit-formula">
        <h4>Cálculo de Ganancia</h4>
        <div className="formula">
          <span className="formula-part positive">${report.totalSales.toFixed(2)}</span>
          <span className="formula-operator">-</span>
          <span className="formula-part negative">${report.productCosts.toFixed(2)}</span>
          <span className="formula-operator">-</span>
          <span className="formula-part negative">${report.workerPayments.toFixed(2)}</span>
          <span className="formula-operator">-</span>
          <span className="formula-part negative">${report.operatingExpenses.toFixed(2)}</span>
          <span className="formula-operator">=</span>
          <span className={`formula-part result ${report.netProfit >= 0 ? 'positive' : 'negative'}`}>
            ${report.netProfit.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
