import { Worker, WorkerRole } from '../../Domain/Entities/Worker';
import './WorkerList.css';

interface WorkerListProps {
  workers: Worker[];
  onToggleActive: (workerId: string, active: boolean) => Promise<void>;
}

export const WorkerList = ({ workers, onToggleActive }: WorkerListProps) => {
  const getRoleLabel = (role: WorkerRole): string => {
    const labels: Record<WorkerRole, string> = {
      'COCINERO': 'Cocinero',
      'REPARTIDOR': 'Repartidor',
      'COMPRADOR': 'Comprador',
      'LOGISTICA': 'Logística'
    };
    return labels[role];
  };

  return (
    <div className="worker-list">
      <h3>Lista de Trabajadores</h3>
      
      {workers.length === 0 ? (
        <p className="empty-message">No hay trabajadores registrados</p>
      ) : (
        <div className="workers-grid">
          {workers.map(worker => (
            <div key={worker.id} className={`worker-card ${!worker.active ? 'inactive' : ''}`}>
              <div className="worker-header">
                <h4>{worker.name}</h4>
                <span className={`status-badge ${worker.active ? 'active' : 'inactive'}`}>
                  {worker.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              
              <div className="worker-info">
                <div className="info-row">
                  <span className="label">Roles:</span>
                  <div className="roles-tags">
                    {worker.roles.map(role => (
                      <span key={role} className="role-tag">
                        {getRoleLabel(role)}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="info-row">
                  <span className="label">Pago por venta:</span>
                  <span className="value">${worker.paymentPerSale.toFixed(2)}</span>
                </div>
              </div>

              <button
                className={`toggle-button ${worker.active ? 'deactivate' : 'activate'}`}
                onClick={() => onToggleActive(worker.id, !worker.active)}
              >
                {worker.active ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
