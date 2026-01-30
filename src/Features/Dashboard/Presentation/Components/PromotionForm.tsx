import { useState } from 'react';
import { Product } from '../../Domain/Entities/Product';
import { Promotion, PromotionProduct } from '../../Domain/Entities/Promotion';
import './PromotionForm.css';

interface PromotionFormProps {
  products: Product[];
  onSubmit: (promotion: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt' | 'productName' | 'secondaryProductName'>) => Promise<void>;
  onCancel?: () => void;
}

export const PromotionForm = ({ products, onSubmit, onCancel }: PromotionFormProps) => {
  const [productId, setProductId] = useState('');
  const [secondaryProductId, setSecondaryProductId] = useState('');
  const [promotionProducts, setPromotionProducts] = useState<PromotionProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('1');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y' | 'PACKAGE_PRICE'>('PACKAGE_PRICE');
  const [discountValue, setDiscountValue] = useState('');
  const [packagePrice, setPackagePrice] = useState('');
  const [buyQuantity, setBuyQuantity] = useState('');
  const [getQuantity, setGetQuantity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateTotalRegularPrice = () => {
    return promotionProducts.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  };

  const handleAddProduct = () => {
    if (!selectedProductId) {
      setError('Selecciona un producto');
      return;
    }

    const quantity = parseInt(selectedQuantity);
    if (quantity <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (!product) {
      setError('Producto no encontrado');
      return;
    }

    // Verificar si el producto ya existe
    const existingIndex = promotionProducts.findIndex(p => p.productId === selectedProductId);
    if (existingIndex >= 0) {
      // Actualizar cantidad
      const updated = [...promotionProducts];
      updated[existingIndex].quantity += quantity;
      setPromotionProducts(updated);
    } else {
      // Agregar nuevo producto
      setPromotionProducts([...promotionProducts, {
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        unitPrice: product.price
      }]);
    }

    setSelectedProductId('');
    setSelectedQuantity('1');
    setError('');
  };

  const handleRemoveProduct = (productId: string) => {
    setPromotionProducts(promotionProducts.filter(p => p.productId !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (promotionProducts.length === 0) {
        throw new Error('Debe agregar al menos un producto a la promoción');
      }

      // Mantener compatibilidad con campos antiguos
      const firstProduct = promotionProducts[0];
      const secondProduct = promotionProducts.length > 1 ? promotionProducts[1] : undefined;

      await onSubmit({
        productId: firstProduct.productId,
        secondaryProductId: secondProduct?.productId,
        products: promotionProducts,
        name: name.trim(),
        description: description.trim(),
        discountType,
        discountValue: parseFloat(discountValue) || 0,
        packagePrice: packagePrice ? parseFloat(packagePrice) : undefined,
        buyQuantity: buyQuantity ? parseInt(buyQuantity) : undefined,
        getQuantity: getQuantity ? parseInt(getQuantity) : undefined,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        active
      });

      // Limpiar formulario
      setProductId('');
      setSecondaryProductId('');
      setPromotionProducts([]);
      setSelectedProductId('');
      setSelectedQuantity('1');
      setName('');
      setDescription('');
      setDiscountValue('');
      setPackagePrice('');
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
        <label htmlFor="name">Nombre de la Promoción:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: 2 Baguettes + Soda"
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

      {/* Sección para agregar productos */}
      <div className="products-section">
        <h4>Productos del Paquete</h4>
        <div className="add-product-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label htmlFor="selectedProduct">Producto:</label>
            <select
              id="selectedProduct"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">Seleccionar producto</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="selectedQuantity">Cantidad:</label>
            <input
              id="selectedQuantity"
              type="number"
              min="1"
              value={selectedQuantity}
              onChange={(e) => setSelectedQuantity(e.target.value)}
            />
          </div>
          <button 
            type="button" 
            className="btn-add-product" 
            onClick={handleAddProduct}
          >
            Agregar
          </button>
        </div>

        {promotionProducts.length > 0 && (
          <div className="products-list">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {promotionProducts.map(item => (
                  <tr key={item.productId}>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>${item.unitPrice.toFixed(2)}</td>
                    <td>${(item.unitPrice * item.quantity).toFixed(2)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => handleRemoveProduct(item.productId)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan={3}><strong>Total Regular:</strong></td>
                  <td colSpan={2}><strong>${calculateTotalRegularPrice().toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="discountType">Tipo de Descuento:</label>
        <select
          id="discountType"
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value as any)}
        >
          <option value="PACKAGE_PRICE">Precio de Paquete</option>
          <option value="PERCENTAGE">Porcentaje</option>
          <option value="FIXED_AMOUNT">Monto Fijo</option>
          <option value="BUY_X_GET_Y">Compra X Lleva Y (2x1, 3x2, etc.)</option>
        </select>
      </div>

      {discountType === 'PACKAGE_PRICE' ? (
        <div className="package-price-section">
          <div className="form-group">
            <label htmlFor="packagePrice">Precio del Paquete:</label>
            <input
              id="packagePrice"
              type="number"
              min="0"
              step="0.01"
              value={packagePrice}
              onChange={(e) => setPackagePrice(e.target.value)}
              placeholder="120.00"
              required
            />
          </div>
          {promotionProducts.length > 0 && packagePrice && (
            <div className="price-comparison">
              <p>Precio Regular: <strong>${calculateTotalRegularPrice().toFixed(2)}</strong></p>
              <p>Precio Promoción: <strong className="promo-price">${parseFloat(packagePrice).toFixed(2)}</strong></p>
              <p className="savings">Ahorro: <strong>${(calculateTotalRegularPrice() - parseFloat(packagePrice)).toFixed(2)}</strong></p>
            </div>
          )}
        </div>
      ) : discountType === 'BUY_X_GET_Y' ? (
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
