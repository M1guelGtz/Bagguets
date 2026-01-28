import { useState } from 'react';
import { Product } from '../../Domain/Entities/Product';
import { Promotion } from '../../Domain/Entities/Promotion';
import './PromotionForm.css';

interface PromotionFormProps {
  products: Product[];
  onSubmit: (promotion: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt' | 'productName'>) => Promise<void>;
  onCancel?: () => void;
}

export const PromotionForm = ({ products, onSubmit, onCancel }: PromotionFormProps) => {
  const [productId, setProductId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [buyQuantity, setBuyQuantity] = useState('');
  const [getQuantity, setGetQuantity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit({
        productId,
        name: name.trim(),
        description: description.trim(),
        discountType,
        discountValue: parseFloat(discountValue) || 0,
        buyQuantity: buyQuantity ? parseInt(buyQuantity) : undefined,
        getQuantity: getQuantity ? parseInt(getQuantity) : undefined,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        active
      });

      // Limpiar formulario
      setProductId('');
      setName('');
      setDescription('');
      setDiscountValue('');
      setBuyQuantity('');
      setGetQuantity('');
      setStartDate('');
      setEndDate('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear promoción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="promotion-form" onSubmit={handleSubmit}>
      <h3>Nueva Promoción</h3>
      
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="product">Producto:</label>
        <select
          id="product"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
        >
          <option value="">Seleccionar producto</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>
              {product.name} - ${product.price.toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="name">Nombre de la Promoción:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: 2x1 Enero"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Descripción:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción de la promoción"
          rows={3}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="discountType">Tipo de Descuento:</label>
        <select
          id="discountType"
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value as any)}
        >
          <option value="PERCENTAGE">Porcentaje</option>
          <option value="FIXED_AMOUNT">Monto Fijo</option>
          <option value="BUY_X_GET_Y">Compra X Lleva Y (2x1, 3x2, etc.)</option>
        </select>
      </div>

      {discountType === 'BUY_X_GET_Y' ? (
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="buyQuantity">Compra:</label>
            <input
              id="buyQuantity"
              type="number"
              min="1"
              value={buyQuantity}
              onChange={(e) => setBuyQuantity(e.target.value)}
              placeholder="2"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="getQuantity">Lleva:</label>
            <input
              id="getQuantity"
              type="number"
              min="1"
              value={getQuantity}
              onChange={(e) => setGetQuantity(e.target.value)}
              placeholder="1"
              required
            />
          </div>
        </div>
      ) : (
        <div className="form-group">
          <label htmlFor="discountValue">
            {discountType === 'PERCENTAGE' ? 'Porcentaje de Descuento (%)' : 'Monto de Descuento ($)'}:
          </label>
          <input
            id="discountValue"
            type="number"
            min="0"
            step={discountType === 'PERCENTAGE' ? '1' : '0.01'}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder={discountType === 'PERCENTAGE' ? '20' : '50.00'}
            required
          />
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate">Fecha de Inicio:</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">Fecha de Fin:</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Promoción activa
        </label>
      </div>

      <div className="form-buttons">
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Crear Promoción'}
        </button>
      </div>
    </form>
  );
};
