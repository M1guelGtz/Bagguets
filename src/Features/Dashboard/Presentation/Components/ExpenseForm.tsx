import React, { useState } from 'react';
import { Expense } from '../../Domain/Entities/Expense';
import { Ingredient } from '../../Domain/Entities/Ingredient';
import './ExpenseForm.css';

interface ExpenseFormProps {
  ingredients: Ingredient[];
  onSubmit: (data: {
    description: string;
    amount: number;
    category: Expense['category'];
    notes?: string;
    ingredientId?: string;
    quantity?: number;
  }) => Promise<void>;
  onCancel?: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ ingredients, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    category: 'OTHER' as Expense['category'],
    notes: '',
    ingredientId: '',
    quantity: 0,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit({
        description: formData.description,
        amount: formData.amount,
        category: formData.category,
        notes: formData.notes || undefined,
        ingredientId: formData.ingredientId || undefined,
        quantity: formData.ingredientId && formData.quantity > 0 ? formData.quantity : undefined,
      });
      setFormData({
        description: '',
        amount: 0,
        category: 'OTHER',
        notes: '',
        ingredientId: '',
        quantity: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar gasto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h2>Nuevo Gasto</h2>

      <div className="form-group">
        <label>Descripción *</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Monto *</label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            required
          />
        </div>

        <div className="form-group">
          <label>Categoría *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as Expense['category'] })}
          >
            <option value="SUPPLIES">Suministros</option>
            <option value="SERVICES">Servicios</option>
            <option value="SALARIES">Salarios</option>
            <option value="RENT">Renta</option>
            <option value="UTILITIES">Servicios Públicos</option>
            <option value="OTHER">Otro</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Notas</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Vincular a Insumo (opcional)</label>
        <select
          value={formData.ingredientId}
          onChange={(e) => setFormData({ ...formData, ingredientId: e.target.value })}
        >
          <option value="">Sin vincular - Solo gasto</option>
          {ingredients.map((ingredient) => (
            <option key={ingredient.id} value={ingredient.id}>
              {ingredient.name} ({ingredient.unit})
            </option>
          ))}
        </select>
        <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
          Selecciona un insumo si este gasto es para comprar inventario
        </small>
      </div>

      {formData.ingredientId && (
        <div className="form-group">
          <label>Cantidad a Agregar al Stock *</label>
          <input
            type="number"
            step="0.01"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
            required={!!formData.ingredientId}
          />
          <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
            Se agregará esta cantidad al stock del insumo seleccionado
          </small>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Registrar Gasto'}
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
