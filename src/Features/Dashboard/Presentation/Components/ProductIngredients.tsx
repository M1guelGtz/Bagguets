import React, { useState } from 'react';
import { Ingredient } from '../../Domain/Entities/Ingredient';
import { ProductIngredient } from '../../Domain/Entities/ProductIngredient';
import './ProductIngredients.css';

interface ProductIngredientsProps {
  ingredients: Ingredient[];
  productIngredients: ProductIngredient[];
  onAddIngredient: (ingredientId: string, quantity: number) => Promise<void>;
  onRemoveIngredient: (productIngredientId: string) => Promise<void>;
}

export const ProductIngredients: React.FC<ProductIngredientsProps> = ({
  ingredients,
  productIngredients,
  onAddIngredient,
  onRemoveIngredient,
}) => {
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedIngredient) {
      setError('Selecciona un insumo');
      return;
    }

    if (quantity <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    setLoading(true);
    try {
      await onAddIngredient(selectedIngredient, quantity);
      setSelectedIngredient('');
      setQuantity(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar insumo');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveIngredient = async (productIngredientId: string) => {
    if (confirm('¿Deseas eliminar este insumo del producto?')) {
      try {
        await onRemoveIngredient(productIngredientId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al eliminar insumo');
      }
    }
  };

  const availableIngredients = ingredients.filter(
    (ing) => !productIngredients.some((pi) => pi.ingredientId === ing.id)
  );

  return (
    <div className="product-ingredients">
      <h2>Insumos del Producto</h2>

      {productIngredients.length === 0 ? (
        <div className="empty-ingredients">
          <p>No hay insumos vinculados a este producto</p>
        </div>
      ) : (
        <div className="ingredients-list">
          <table>
            <thead>
              <tr>
                <th>Insumo</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {productIngredients.map((pi) => (
                <tr key={pi.id}>
                  <td>{pi.ingredientName}</td>
                  <td>{pi.quantity}</td>
                  <td>{pi.unit}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-remove-ingredient"
                      onClick={() => handleRemoveIngredient(pi.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {availableIngredients.length > 0 && (
        <form onSubmit={handleAddIngredient} style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#333' }}>
            Agregar Insumo
          </h3>

          <div className="ingredient-selector">
            <div className="form-group">
              <label>Insumo</label>
              <select
                value={selectedIngredient}
                onChange={(e) => setSelectedIngredient(e.target.value)}
              >
                <option value="">Seleccionar insumo</option>
                {availableIngredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} ({ing.stock} {ing.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Cantidad Necesaria</label>
              <input
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                placeholder="Ej: 100"
              />
            </div>

            <button type="submit" className="btn-add-ingredient" disabled={loading}>
              {loading ? 'Agregando...' : 'Agregar'}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
        </form>
      )}
    </div>
  );
};
