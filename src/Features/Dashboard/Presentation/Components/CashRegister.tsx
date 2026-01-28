import React, { useState } from 'react';
import { CashRegister as CashRegisterType } from '../../Domain/Entities/CashRegister';
import './CashRegister.css';

interface CashRegisterProps {
  cashRegister: CashRegisterType | null;
  onOpen: (openingBalance: number) => Promise<void>;
  onClose: (actualBalance: number, notes?: string) => Promise<void>;
}

export const CashRegister: React.FC<CashRegisterProps> = ({
  cashRegister,
  onOpen,
  onClose,
}) => {
  const [openingBalance, setOpeningBalance] = useState(0);
  const [actualBalance, setActualBalance] = useState(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onOpen(openingBalance);
      setOpeningBalance(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al abrir caja');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onClose(actualBalance, notes || undefined);
      setActualBalance(0);
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar caja');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  if (!cashRegister) {
    return (
      <div className="cash-register">
        <h2>Caja Registradora</h2>
        <div className="cash-status closed">
          <p>La caja está cerrada</p>
          <form onSubmit={handleOpen}>
            <div className="form-group">
              <label>Saldo Inicial</label>
              <input
                type="number"
                step="0.01"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(parseFloat(e.target.value))}
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="btn-success" disabled={loading}>
              {loading ? 'Abriendo...' : 'Abrir Caja'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="cash-register">
      <h2>Caja Registradora</h2>
      <div className="cash-status open">
        <p>La caja está abierta</p>
        <div className="cash-info">
          <div className="cash-info-item">
            <label>Saldo Inicial</label>
            <div className="value">{formatCurrency(cashRegister.openingBalance)}</div>
          </div>
          <div className="cash-info-item">
            <label>Total Ventas</label>
            <div className="value">{formatCurrency(cashRegister.totalSales)}</div>
          </div>
          <div className="cash-info-item">
            <label>Total Gastos</label>
            <div className="value">{formatCurrency(cashRegister.totalExpenses)}</div>
          </div>
          <div className="cash-info-item">
            <label>Saldo Esperado</label>
            <div className="value">{formatCurrency(cashRegister.expectedBalance)}</div>
          </div>
        </div>

        <form onSubmit={handleClose} style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label>Saldo Real en Caja</label>
            <input
              type="number"
              step="0.01"
              value={actualBalance}
              onChange={(e) => setActualBalance(parseFloat(e.target.value))}
              required
            />
          </div>
          <div className="form-group">
            <label>Notas de Cierre</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn-danger" disabled={loading}>
            {loading ? 'Cerrando...' : 'Cerrar Caja'}
          </button>
        </form>
      </div>
    </div>
  );
};
