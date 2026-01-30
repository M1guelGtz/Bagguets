import React, { useState } from 'react';
import { Worker } from '../../Domain/Entities/Worker';
import './ManualWorkerPaymentForm.css';

interface ManualWorkerPaymentFormProps {
  workers: Worker[];
  onSubmit: (data: {
    workerId: string;
    amount: number;
    reason: string;
    notes?: string;
    userId: string;
  }) => Promise<void>;
  onCancel?: () => void;
  userId: string;
}

export const ManualWorkerPaymentForm: React.FC<ManualWorkerPaymentFormProps> = ({
  workers,
  onSubmit,
  onCancel,
  userId
}) => {
  const [workerId, setWorkerId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeWorkers = workers.filter(w => w.active);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!workerId) {
        throw new Error('Debe seleccionar un trabajador');
      }

      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }

      if (!reason.trim()) {
        throw new Error('La razón del pago es requerida');
      }

      await onSubmit({
        workerId,
        amount: parseFloat(amount),
        reason: reason.trim(),
        notes: notes.trim() || undefined,
        userId
      });

      // Limpiar formulario
      setWorkerId('');
      setAmount('');
      setReason('');
      setNotes('');
      alert('Pago manual registrado exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="manual-payment-form" onSubmit={handleSubmit}>
      <h3>Registrar Pago Manual a Trabajador</h3>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="workerId">Trabajador:</label>
        <select
          id="workerId"
          value={workerId}
          onChange={(e) => setWorkerId(e.target.value)}
          required
        >
          <option value="">Seleccionar trabajador</option>
          {activeWorkers.map(worker => (
            <option key={worker.id} value={worker.id}>
              {worker.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="amount">Monto ($):</label>
        <input
          id="amount"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="reason">Razón del Pago:</label>
        <select
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        >
          <option value="">Seleccionar razón</option>
          <option value="Tarea extra">Tarea Extra</option>
          <option value="Adelanto">Adelanto</option>
          <option value="Bono">Bono</option>
          <option value="Compensación">Compensación</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      {reason === 'Otro' && (
        <div className="form-group">
          <label htmlFor="otherReason">Especificar razón:</label>
          <input
            id="otherReason"
            type="text"
            value={reason === 'Otro' ? '' : reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ingresa la razón"
            required
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="notes">Notas (Opcional):</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas adicionales"
          rows={3}
        />
      </div>

      <div className="form-buttons">
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Procesando...' : 'Registrar Pago'}
        </button>
      </div>
    </form>
  );
};
