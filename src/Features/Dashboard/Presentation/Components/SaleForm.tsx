import React, { useState } from 'react';
import { Product } from '../../Domain/Entities/Product';
import { Promotion } from '../../Domain/Entities/Promotion';
import { Worker } from '../../Domain/Entities/Worker';
import './SaleForm.css';

interface SaleFormProps {
  products: Product[];
  promotions: Promotion[];
  workers: Worker[];
  onSubmit: (data: {
    items: Array<{ productId: string; quantity: number; promotionId?: string }>;
    paymentMethod: 'CASH' | 'CARD' | 'TRANSFER';
    cookId?: string;
    deliveryId?: string;
    notes?: string;
  }) => Promise<void>;
  onCancel?: () => void;
}

interface SaleItem {
  productId: string;
  quantity: number;
  promotionId?: string;
}

export const SaleForm: React.FC<SaleFormProps> = ({ products, promotions, workers, onSubmit, onCancel }) => {
  const [items, setItems] = useState<SaleItem[]>([{ productId: '', quantity: 1, promotionId: undefined }]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CASH');
  const [cookId, setCookId] = useState('');
  const [deliveryId, setDeliveryId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  console.log('SaleForm - products:', products);
  console.log('SaleForm - promotions:', promotions);
  console.log('SaleForm - workers:', workers);

  const activeWorkers = workers.filter(w => w.active);
  const cooks = activeWorkers.filter(w => w.roles.includes('COCINERO'));
  const deliveryWorkers = activeWorkers.filter(w => w.roles.includes('REPARTIDOR'));
  
  const now = new Date();
  const activePromotions = promotions.filter(p => 
    p.active && 
    new Date(p.startDate) <= now && 
    new Date(p.endDate) >= now
  );

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, promotionId: undefined }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof SaleItem, value: string | number | undefined) => {
    console.log('updateItem called:', { index, field, value });
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    console.log('Updated items:', newItems);
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return sum;
      
      const promotion = item.promotionId ? activePromotions.find(p => p.id === item.promotionId) : null;
      let itemTotal = product.price * item.quantity;
      
      if (promotion) {
        if (promotion.discountType === 'PERCENTAGE') {
          itemTotal = itemTotal * (1 - promotion.discountValue / 100);
        } else if (promotion.discountType === 'FIXED_AMOUNT') {
          itemTotal = Math.max(0, itemTotal - promotion.discountValue * item.quantity);
        } else if (promotion.discountType === 'BUY_X_GET_Y' && promotion.buyQuantity && promotion.getQuantity) {
          const setsCount = Math.floor(item.quantity / promotion.buyQuantity);
          const chargeableUnits = item.quantity - (setsCount * promotion.getQuantity);
          itemTotal = product.price * chargeableUnits;
        }
      }
      
      return sum + itemTotal;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const validItems = items.filter((item) => item.productId && item.quantity > 0);
      if (validItems.length === 0) {
        throw new Error('Agrega al menos un producto');
      }

      await onSubmit({
        items: validItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          promotionId: item.promotionId
        })),
        paymentMethod,
        cookId: cookId || undefined,
        deliveryId: deliveryId || undefined,
        notes: notes || undefined,
      });

      setItems([{ productId: '', quantity: 1, promotionId: undefined }]);
      setCookId('');
      setDeliveryId('');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="sale-form" onSubmit={handleSubmit}>
      <h2>Nueva Venta</h2>

      {products.length === 0 && (
        <div className="error-message">
          No hay productos disponibles. Por favor, crea productos primero.
        </div>
      )}

      <div className="sale-items">
        {items.map((item, index) => (
          <div key={index} className="sale-item">
            <div className="form-group">
              <label>Producto</label>
              <select
                value={item.productId}
                onChange={(e) => {
                  const newProductId = e.target.value;
                  console.log('Producto seleccionado:', newProductId);
                  console.log('Item actual:', item);
                  const newItems = [...items];
                  newItems[index] = { 
                    ...newItems[index], 
                    productId: newProductId,
                    promotionId: undefined 
                  };
                  console.log('Nuevos items:', newItems);
                  setItems(newItems);
                }}
                required
                disabled={products.length === 0}
              >
                <option value="">Seleccionar producto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${product.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {item.productId && activePromotions.filter(p => p.productId === item.productId).length > 0 && (
              <div className="form-group">
                <label>Promoción (opcional)</label>
                <select
                  value={item.promotionId || ''}
                  onChange={(e) => updateItem(index, 'promotionId', e.target.value || undefined)}
                >
                  <option value="">Sin promoción</option>
                  {activePromotions
                    .filter(p => p.productId === item.productId)
                    .map((promotion) => {
                      let discountText = '';
                      if (promotion.discountType === 'PERCENTAGE') {
                        discountText = `${promotion.discountValue}% OFF`;
                      } else if (promotion.discountType === 'FIXED_AMOUNT') {
                        discountText = `$${promotion.discountValue} OFF`;
                      } else if (promotion.discountType === 'BUY_X_GET_Y') {
                        discountText = `${promotion.buyQuantity}x${(promotion.buyQuantity || 0) + (promotion.getQuantity || 0)}`;
                      }
                      return (
                        <option key={promotion.id} value={promotion.id}>
                          {promotion.name} - {discountText}
                        </option>
                      );
                    })}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Cantidad</label>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                required
              />
            </div>

            {items.length > 1 && (
              <button type="button" className="btn-remove" onClick={() => removeItem(index)}>
                Eliminar
              </button>
            )}
          </div>
        ))}
      </div>

      <button type="button" className="btn-add" onClick={addItem}>
        + Agregar Producto
      </button>

      <div className="sale-total">Total: ${calculateTotal().toFixed(2)}</div>

      <div className="form-group">
        <label>Método de Pago</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as 'CASH' | 'CARD' | 'TRANSFER')}
        >
          <option value="CASH">Efectivo</option>
          <option value="CARD">Tarjeta</option>
          <option value="TRANSFER">Transferencia</option>
        </select>
      </div>

      <div className="workers-section">
        <h3>Asignar Trabajadores</h3>
        <div className="worker-selects">
          <div className="form-group">
            <label>Cocinero (opcional)</label>
            <select value={cookId} onChange={(e) => setCookId(e.target.value)}>
              <option value="">Sin asignar</option>
              {cooks.map(worker => (
                <option key={worker.id} value={worker.id}>
                  {worker.name} (${worker.paymentPerSale})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Repartidor (opcional)</label>
            <select value={deliveryId} onChange={(e) => setDeliveryId(e.target.value)}>
              <option value="">Sin asignar</option>
              {deliveryWorkers.map(worker => (
                <option key={worker.id} value={worker.id}>
                  {worker.name} (${worker.paymentPerSale})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Notas</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Procesando...' : 'Registrar Venta'}
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
