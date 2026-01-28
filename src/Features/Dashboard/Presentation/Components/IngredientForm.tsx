import React, { useState } from 'react';
import './IngredientForm.css';

interface IngredientFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    unit: string;
    stock: number;
    minStock: number;
    cost: number;
  }) => Promise<void>;
  onCancel?: () => void;
}

export const IngredientForm: React.FC<IngredientFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: 'kg',
    stock: 0,
    minStock: 0,
    cost: 0,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await onSubmit(formData);
      setSuccess('Insumo creado exitosamente');
      setFormData({
        name: '',
        description: '',
        unit: 'kg',
        stock: 0,
        minStock: 0,
        cost: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear insumo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="ingredient-form" onSubmit={handleSubmit}>
      <h2>Nuevo Insumo</h2>

      <div className="form-group">
        <label>Nombre *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Descripción</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Unidad de Medida *</label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            required
          >
            <option value="kg">Kilogramos (kg)</option>
            <option value="g">Gramos (g)</option>
            <option value="L">Litros (L)</option>
            <option value="ml">Mililitros (ml)</option>
            <option value="piezas">Piezas</option>
            <option value="metro">Metros</option>
          </select>
        </div>

        <div className="form-group">
          <label>Costo por Unidad *</label>
          <input
            type="number"
            step="0.01"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Stock Inicial *</label>
          <input
            type="number"
            step="0.01"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) })}
            required
          />
        </div>

        <div className="form-group">
          <label>Stock Mínimo *</label>
          <input
            type="number"
            step="0.01"
            value={formData.minStock}
            onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) })}
            required
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Crear Insumo'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};
