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
                    <p className="product-name">{promo.productName}</p>
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
