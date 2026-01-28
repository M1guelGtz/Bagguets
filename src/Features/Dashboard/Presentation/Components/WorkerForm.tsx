import { useState } from 'react';
import { Worker, WorkerRole } from '../../Domain/Entities/Worker';
import './WorkerForm.css';

interface WorkerFormProps {
  onSubmit: (worker: Omit<Worker, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const WorkerForm = ({ onSubmit }: WorkerFormProps) => {
  const [name, setName] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<WorkerRole[]>([]);
  const [paymentPerSale, setPaymentPerSale] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles: { value: WorkerRole; label: string }[] = [
    { value: 'COCINERO', label: 'Cocinero' },
    { value: 'REPARTIDOR', label: 'Repartidor' },
    { value: 'COMPRADOR', label: 'Comprador' },
    { value: 'LOGISTICA', label: 'Logística' }
  ];

  const handleRoleToggle = (role: WorkerRole) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit({
        name: name.trim(),
        roles: selectedRoles,
        paymentPerSale: parseFloat(paymentPerSale),
        active: true
      });

      // Limpiar formulario
      setName('');
      setSelectedRoles([]);
      setPaymentPerSale('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear trabajador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="worker-form" onSubmit={handleSubmit}>
      <h3>Nuevo Trabajador</h3>
      
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="name">Nombre:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del trabajador"
          required
        />
      </div>

      <div className="form-group">
        <label>Roles:</label>
        <div className="roles-checkboxes">
          {roles.map(role => (
            <label key={role.value} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedRoles.includes(role.value)}
                onChange={() => handleRoleToggle(role.value)}
              />
              {role.label}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="payment">Pago por Venta ($):</label>
        <input
          id="payment"
          type="number"
          min="0"
          step="0.01"
          value={paymentPerSale}
          onChange={(e) => setPaymentPerSale(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Crear Trabajador'}
      </button>
    </form>
  );
};
