import { WorkerEarnings } from '../../Domain/UseCases/GetWorkerEarningsUseCase';
import './WorkerEarningsReport.css';

interface WorkerEarningsReportProps {
  earnings: WorkerEarnings[];
  onPayWorker: (workerId: string, amount: number) => Promise<void>;
}

export const WorkerEarningsReport = ({ earnings, onPayWorker }: WorkerEarningsReportProps) => {
  const handlePay = async (workerId: string, pendingAmount: number) => {
    const amount = prompt(`¿Cuánto deseas pagar? (Máximo: $${pendingAmount.toFixed(2)})`);
    if (!amount) return;

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      alert('Monto inválido');
      return;
    }

    if (paymentAmount > pendingAmount) {
      alert('El monto excede lo pendiente');
      return;
    }

    try {
      await onPayWorker(workerId, paymentAmount);
      alert('Pago registrado exitosamente');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al procesar el pago');
    }
  };

  const totalEarned = earnings.reduce((sum, e) => sum + e.totalEarned, 0);
  const totalPaid = earnings.reduce((sum, e) => sum + e.totalPaid, 0);
  const totalPending = earnings.reduce((sum, e) => sum + e.totalPending, 0);

  return (
    <div className="earnings-report">
      <h3>Reporte de Ganancias por Trabajador</h3>

      <div className="summary-cards">
        <div className="summary-card earned">
          <div className="summary-label">Total Ganado</div>
          <div className="summary-value">${totalEarned.toFixed(2)}</div>
        </div>
        <div className="summary-card paid">
          <div className="summary-label">Total Pagado</div>
          <div className="summary-value">${totalPaid.toFixed(2)}</div>
        </div>
        <div className="summary-card pending">
          <div className="summary-label">Total Pendiente</div>
          <div className="summary-value">${totalPending.toFixed(2)}</div>
        </div>
      </div>

      {earnings.length === 0 ? (
        <p className="empty-message">No hay ganancias registradas</p>
      ) : (
        <div className="earnings-table">
          <table>
            <thead>
              <tr>
                <th>Trabajador</th>
                <th>Ventas</th>
                <th>Total Ganado</th>
                <th>Pagado</th>
                <th>Pendiente</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map(earning => (
                <tr key={earning.workerId}>
                  <td className="worker-name">{earning.workerName}</td>
                  <td>{earning.totalSales}</td>
                  <td className="amount">${earning.totalEarned.toFixed(2)}</td>
                  <td className="amount paid-amount">${earning.totalPaid.toFixed(2)}</td>
                  <td className="amount pending-amount">${earning.totalPending.toFixed(2)}</td>
                  <td>
                    {earning.totalPending > 0 ? (
                      <button
                        className="pay-button"
                        onClick={() => handlePay(earning.workerId, earning.totalPending)}
                      >
                        Pagar
                      </button>
                    ) : (
                      <span className="no-pending">Sin pendientes</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
