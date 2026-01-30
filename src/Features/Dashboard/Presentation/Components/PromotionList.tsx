import { Promotion } from '../../Domain/Entities/Promotion';
import './PromotionList.css';

interface PromotionListProps {
  promotions: Promotion[];
  onToggleActive: (promotionId: string, active: boolean) => Promise<void>;
  onDelete: (promotionId: string) => Promise<void>;
}

export const PromotionList = ({ promotions, onToggleActive, onDelete }: PromotionListProps) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDiscountText = (promo: Promotion): string => {
    switch (promo.discountType) {
      case 'PACKAGE_PRICE':
        return `Precio de Paquete: $${promo.packagePrice?.toFixed(2) || '0.00'}`;
      case 'PERCENTAGE':
        return `${promo.discountValue}% de descuento`;
      case 'FIXED_AMOUNT':
        return `$${promo.discountValue} de descuento`;
      case 'BUY_X_GET_Y':
        return `Compra ${promo.buyQuantity} lleva ${promo.getQuantity}`;
      default:
        return '';
    }
  };

  const calculateRegularPrice = (products: any[]): number => {
    if (!products || products.length === 0) return 0;
    return products.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  };

  const isExpired = (endDate: Date): boolean => {
    return new Date(endDate) < new Date();
  };

  const isUpcoming = (startDate: Date): boolean => {
    return new Date(startDate) > new Date();
  };

  const handleDelete = async (promotionId: string, promotionName: string) => {
    if (confirm(`¿Estás seguro de eliminar la promoción "${promotionName}"?`)) {
      await onDelete(promotionId);
    }
  };

  return (
    <div className="promotion-list">
      <h3>Lista de Promociones</h3>
      
      {promotions.length === 0 ? (
        <p className="empty-message">No hay promociones registradas</p>
      ) : (
        <div className="promotions-grid">
          {promotions.map(promo => {
            const expired = isExpired(promo.endDate);
            const upcoming = isUpcoming(promo.startDate);
            
            return (
              <div 
                key={promo.id} 
                className={`promotion-card ${!promo.active || expired ? 'inactive' : ''} ${upcoming ? 'upcoming' : ''}`}
              >
                <div className="promotion-header">
                  <div>
                    <h4>{promo.name}</h4>
                    {promo.products && promo.products.length > 0 ? (
                      <div className="products-list-promo">
                        {promo.products.map((product, index) => (
                          <p key={index} className="product-item">
                            {product.quantity}x {product.productName} (${product.unitPrice.toFixed(2)})
                          </p>
                        ))}
                      </div>
                    ) : (
                      <>
                        <p className="product-name">{promo.productName}</p>
                        {promo.secondaryProductName && (
                          <p className="secondary-product-name">+ {promo.secondaryProductName}</p>
                        )}
                      </>
                    )}
                  </div>
                  <div className="status-badges">
                    {expired && <span className="badge expired">Expirada</span>}
                    {upcoming && <span className="badge upcoming">Próximamente</span>}
                    {!expired && !upcoming && promo.active && (
                      <span className="badge active">Activa</span>
                    )}
                    {!promo.active && <span className="badge inactive">Inactiva</span>}
                  </div>
                </div>

                <p className="promotion-description">{promo.description}</p>

                <div className="promotion-details">
                  <div className="discount-info">
                    <span className="discount-text">{getDiscountText(promo)}</span>
                    {promo.discountType === 'PACKAGE_PRICE' && promo.products && promo.products.length > 0 && (
                      <div className="price-comparison-small">
                        <span className="regular-price">Regular: ${calculateRegularPrice(promo.products).toFixed(2)}</span>
                        <span className="arrow">→</span>
                        <span className="promo-price">Promo: ${promo.packagePrice?.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="date-range">
                    <span>📅 {formatDate(promo.startDate)} - {formatDate(promo.endDate)}</span>
                  </div>
                </div>

                <div className="promotion-actions">
                  {!expired && (
                    <button
                      className={`toggle-button ${promo.active ? 'deactivate' : 'activate'}`}
                      onClick={() => onToggleActive(promo.id, !promo.active)}
                    >
                      {promo.active ? 'Desactivar' : 'Activar'}
                    </button>
                  )}
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(promo.id, promo.name)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
