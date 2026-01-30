import React, { useState } from 'react';
import { CashRegister } from '../Components/CashRegister';
import { ExpenseForm } from '../Components/ExpenseForm';
import { IngredientForm } from '../Components/IngredientForm';
import { ManualWorkerPaymentForm } from '../Components/ManualWorkerPaymentForm';
import { ProductForm } from '../Components/ProductForm';
import { ProductIngredients } from '../Components/ProductIngredients';
import { ProfitReportView } from '../Components/ProfitReportView';
import { PromotionForm } from '../Components/PromotionForm';
import { PromotionList } from '../Components/PromotionList';
import { SaleForm } from '../Components/SaleForm';
import { StatCard } from '../Components/StatCard';
import { WorkerEarningsReport } from '../Components/WorkerEarningsReport';
import { WorkerForm } from '../Components/WorkerForm';
import { WorkerList } from '../Components/WorkerList';
import { useDashboardViewModel } from '../ViewModel/useDashboardViewModel';
import './Dashboard.css';

type TabType =
  | 'overview'
  | 'products'
  | 'sales'
  | 'cash'
  | 'cash-history'
  | 'expenses'
  | 'inventory'
  | 'ingredients'
  | 'product-ingredients'
  | 'promotions'
  | 'workers'
  | 'earnings'
  | 'profits';

export const Dashboard: React.FC = () => {
  const {
    products,
    ingredients,
    productIngredients,
    promotions,
    productAvailabilities,
    workers,
    workerEarnings,
    profitReport,
    cashRegister,
    cashRegisterHistory,
    todaySales,
    todayExpenses,
    salesGrowth,
    loading,
    createProduct,
    createIngredient,
    editIngredient,
    createPromotion,
    togglePromotionActive,
    deletePromotion,
    linkIngredientToProduct,
    removeIngredientFromProduct,
    addInventory,
    createSale,
    createWorker,
    toggleWorkerActive,
    payWorker,
    createManualWorkerPayment,
    openCashRegister,
    closeCashRegister,
    createExpense,
    getTodayTotals,
  } = useDashboardViewModel();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showManualPaymentForm, setShowManualPaymentForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  const { totalSales, totalExpenses, netBalance } = getTodayTotals();

  const getAvailabilityBadge = (productId: string) => {
    const availability = productAvailabilities.find(a => a.productId === productId);
    if (!availability) return { class: 'unknown', text: 'Calculando...' };
    
    if (!availability.available) {
      return { class: 'no-stock', text: 'Sin insumos' };
    }
    
    if (availability.maxQuantity <= 5) {
      return { class: 'low', text: `Disponible (${availability.maxQuantity})` };
    }
    
    if (availability.maxQuantity <= 20) {
      return { class: 'medium', text: `Disponible (${availability.maxQuantity})` };
    }
    
    return { class: 'high', text: 'Disponible' };
  };

  const getStockBadgeClass = (stock: number, minStock: number) => {
    if (stock <= minStock) return 'low-stock';
    if (stock <= minStock * 2) return 'medium-stock';
    return 'high-stock';
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (date: Date) => new Date(date).toLocaleString('es-MX');

  const renderOverview = () => (
    <div className="overview-container">
      {/* KPI Cards Principales */}
      <div className="kpi-section">
        <div className="stats-grid">
          <StatCard
            title="Ventas del Día"
            value={formatCurrency(totalSales)}
            change={salesGrowth?.growthPercentage.daily}
            changeLabel="vs ayer"
          />
          <StatCard
            title="Gastos del Día"
            value={formatCurrency(totalExpenses)}
          />
          <StatCard
            title="Balance Neto"
            value={formatCurrency(netBalance)}
            change={salesGrowth?.growthPercentage.daily}
          />
          <StatCard
            title="En Caja"
            value={cashRegister ? formatCurrency(cashRegister.expectedBalance) : '$0.00'}
          />
        </div>
      </div>

      {/* Sección de Crecimiento */}
      {salesGrowth && (
        <div className="growth-section">
          <h2>Crecimiento de Ventas</h2>
          <div className="stats-grid">
            <StatCard
              title="Hoy vs Ayer"
              value={formatCurrency(salesGrowth.today)}
              change={salesGrowth.growthPercentage.daily}
            />
            <StatCard
              title="Promedio Semanal"
              value={formatCurrency(salesGrowth.lastWeek / 7)}
              change={salesGrowth.growthPercentage.weekly}
            />
            <StatCard
              title="Promedio Mensual"
              value={formatCurrency(salesGrowth.lastMonth / 30)}
              change={salesGrowth.growthPercentage.monthly}
            />
          </div>
        </div>
      )}

      {/* Sección de Actividad */}
      <div className="activity-section">
        <h2>Actividad de Hoy</h2>
        <div className="activity-grid">
          <div className="activity-card">
            <div className="activity-card-header">
              <h3>Ventas Realizadas</h3>
              <span className="badge">{todaySales.length}</span>
            </div>
            <div className="sales-list">
              {todaySales.length === 0 ? (
                <div className="empty-state">
                  <p>No hay ventas registradas hoy</p>
                </div>
              ) : (
                todaySales.map((sale) => (
                  <div key={sale.id} className="list-item">
                    <div className="list-item-content">
                      <div className="list-item-title">
                        {sale.items.length} producto(s) - {sale.paymentMethod}
                      </div>
                      <div className="list-item-subtitle">{formatDate(sale.date)}</div>
                    </div>
                    <div className="list-item-amount">{formatCurrency(sale.total)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="activity-card">
            <div className="activity-card-header">
              <h3>Gastos Registrados</h3>
              <span className="badge">{todayExpenses.length}</span>
            </div>
            <div className="expenses-list">
              {todayExpenses.length === 0 ? (
                <div className="empty-state">
                  <p>No hay gastos registrados hoy</p>
                </div>
              ) : (
                todayExpenses.map((expense) => (
                  <div key={expense.id} className="list-item">
                    <div className="list-item-content">
                      <div className="list-item-title">{expense.description}</div>
                      <div className="list-item-subtitle">
                        {expense.category} - {formatDate(expense.date)}
                      </div>
                    </div>
                    <div className="list-item-amount">{formatCurrency(expense.amount)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="section-container">
      {!showProductForm ? (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button className="btn btn-primary" onClick={() => setShowProductForm(true)}>
              Nuevo Producto
            </button>
          </div>
          <div className="product-list">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Costo</th>
                  <th>Disponibilidad</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <h3>No hay productos</h3>
                        <p>Crea tu primer producto para comenzar</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const availabilityBadge = getAvailabilityBadge(product.id);
                    return (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>{formatCurrency(product.price)}</td>
                        <td>{formatCurrency(product.cost)}</td>
                        <td>
                          <span className={`stock-badge ${availabilityBadge.class}`}>
                            {availabilityBadge.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <ProductForm
          onSubmit={async (data) => {
            await createProduct(data);
            setShowProductForm(false);
          }}
          onCancel={() => setShowProductForm(false)}
        />
      )}
    </div>
  );

  const renderInventory = () => (
    <div className="section-container">
      <h2>Gestión de Inventario</h2>
      <div className="product-list">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Stock Actual</th>
              <th>Stock Mínimo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="empty-state">
                    <h3>No hay productos</h3>
                    <p>Crea productos primero para gestionar inventario</p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const availability = getAvailabilityBadge(product.id);
                return (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td><span className={`badge ${availability.class}`}>{availability.text}</span></td>
                  <td>
                    {availability.class === 'no-stock' && productAvailabilities.find(a => a.productId === product.id)?.missingIngredients.join(', ')}
                  </td>
                  <td>
                    <div className="inventory-controls">
                      <button
                        className="btn btn-success btn-small"
                        onClick={async () => {
                          const quantity = prompt('Cantidad a agregar:');
                          if (quantity) {
                            await addInventory(
                              product.id,
                              parseInt(quantity),
                              'IN',
                              'Entrada de inventario'
                            );
                          }
                        }}
                      >
                        + Agregar
                      </button>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={async () => {
                          const quantity = prompt('Cantidad a descontar:');
                          if (quantity) {
                            await addInventory(
                              product.id,
                              parseInt(quantity),
                              'OUT',
                              'Salida de inventario'
                            );
                          }
                        }}
                      >
                        - Descontar
                      </button>
                    </div>
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSales = () => (
    <div className="section-container">
      {!showSaleForm ? (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button className="btn btn-primary" onClick={() => setShowSaleForm(true)}>
              Nueva Venta
            </button>
          </div>
          <div className="product-list">
            <h3 style={{ padding: '16px', margin: 0 }}>Ventas de Hoy</h3>
            <div className="sales-list">
              {todaySales.length === 0 ? (
                <div className="empty-state">
                  <h3>No hay ventas</h3>
                  <p>Registra tu primera venta</p>
                </div>
              ) : (
                todaySales.map((sale) => (
                  <div key={sale.id} className="list-item">
                    <div className="list-item-content">
                      <div className="list-item-title">
                        Venta #{sale.id.slice(0, 8)}
                      </div>
                      <div className="list-item-subtitle">
                        {sale.items.map((item) => item.productName).join(', ')}
                      </div>
                      <div className="list-item-subtitle">
                        {formatDate(sale.date)} - {sale.paymentMethod}
                      </div>
                    </div>
                    <div className="list-item-amount">{formatCurrency(sale.total)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <SaleForm
          products={products}
          promotions={promotions}
          workers={workers}
          onSubmit={async (data) => {
            await createSale(data.items, data.paymentMethod, data.cookId, data.deliveryId, data.notes);
            setShowSaleForm(false);
          }}
          onCancel={() => setShowSaleForm(false)}
        />
      )}
    </div>
  );

  const renderCash = () => (
    <div className="section-container">
      <CashRegister
        cashRegister={cashRegister}
        onOpen={openCashRegister}
        onClose={closeCashRegister}
      />
    </div>
  );

  const handlePrintCashHistory = () => {
    const printWindow = window.open('', '', 'height=600,width=900');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Historial de Cortes de Caja</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
          }
          h1 {
            text-align: center;
            margin-bottom: 10px;
          }
          .header-info {
            text-align: center;
            margin-bottom: 20px;
            font-size: 12px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
            font-size: 11px;
          }
          th {
            background-color: #f3f4f6;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .positive {
            color: #10b981;
            font-weight: bold;
          }
          .negative {
            color: #ef4444;
            font-weight: bold;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 11px;
            color: #666;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <h1>Historial de Cortes de Caja</h1>
        <div class="header-info">
          <p>Impresión: ${new Date().toLocaleString('es-ES')}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Fecha Apertura</th>
              <th>Fecha Cierre</th>
              <th>Balance Inicial</th>
              <th>Ventas</th>
              <th>Gastos</th>
              <th>Balance Esperado</th>
              <th>Balance Real</th>
              <th>Diferencia</th>
              <th>Notas</th>
            </tr>
          </thead>
          <tbody>
            ${cashRegisterHistory.map(history => `
              <tr>
                <td>${formatDate(history.openedAt)}</td>
                <td>${formatDate(history.closedAt)}</td>
                <td>${formatCurrency(history.openingBalance)}</td>
                <td>${formatCurrency(history.totalSales)}</td>
                <td>${formatCurrency(history.totalExpenses)}</td>
                <td>${formatCurrency(history.expectedBalance)}</td>
                <td>${formatCurrency(history.actualBalance)}</td>
                <td class="${history.difference === 0 ? 'positive' : 'negative'}">
                  ${formatCurrency(history.difference)}
                </td>
                <td>${history.notes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Total de registros: ${cashRegisterHistory.length}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const renderCashHistory = () => (
    <div className="section-container">
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" onClick={handlePrintCashHistory}>
          🖨️ Imprimir Historial
        </button>
      </div>
      <h2>Historial de Cortes de Caja</h2>
      <div className="product-list">
        <table>
          <thead>
            <tr>
              <th>Fecha Apertura</th>
              <th>Fecha Cierre</th>
              <th>Balance Inicial</th>
              <th>Ventas</th>
              <th>Gastos</th>
              <th>Balance Esperado</th>
              <th>Balance Real</th>
              <th>Diferencia</th>
              <th>Notas</th>
            </tr>
          </thead>
          <tbody>
            {cashRegisterHistory.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">
                    <h3>Sin cortes registrados</h3>
                    <p>Los cortes de caja aparecerán aquí</p>
                  </div>
                </td>
              </tr>
            ) : (
              cashRegisterHistory.map((history) => (
                <tr key={history.id}>
                  <td>{formatDate(history.openedAt)}</td>
                  <td>{formatDate(history.closedAt)}</td>
                  <td>{formatCurrency(history.openingBalance)}</td>
                  <td>{formatCurrency(history.totalSales)}</td>
                  <td>{formatCurrency(history.totalExpenses)}</td>
                  <td>{formatCurrency(history.expectedBalance)}</td>
                  <td>{formatCurrency(history.actualBalance)}</td>
                  <td>
                    <span
                      style={{
                        color: history.difference === 0 ? '#10b981' : '#ef4444',
                        fontWeight: 'bold',
                      }}
                    >
                      {formatCurrency(history.difference)}
                    </span>
                  </td>
                  <td>{history.notes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderExpenses = () => (
    <div className="section-container">
      {!showExpenseForm ? (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button className="btn btn-primary" onClick={() => setShowExpenseForm(true)}>
              Nuevo Gasto
            </button>
          </div>
          <div className="product-list">
            <h3 style={{ padding: '16px', margin: 0 }}>Gastos de Hoy</h3>
            <div className="expenses-list">
              {todayExpenses.length === 0 ? (
                <div className="empty-state">
                  <h3>No hay gastos</h3>
                  <p>Registra tu primer gasto</p>
                </div>
              ) : (
                todayExpenses.map((expense) => (
                  <div key={expense.id} className="list-item">
                    <div className="list-item-content">
                      <div className="list-item-title">{expense.description}</div>
                      <div className="list-item-subtitle">
                        {expense.category} - {formatDate(expense.date)}
                      </div>
                      {expense.notes && (
                        <div className="list-item-subtitle">{expense.notes}</div>
                      )}
                    </div>
                    <div className="list-item-amount">{formatCurrency(expense.amount)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <ExpenseForm
          ingredients={ingredients}
          onSubmit={async (data) => {
            await createExpense(
              data.description,
              data.amount,
              data.category,
              data.notes,
              data.ingredientId,
              data.quantity
            );
            setShowExpenseForm(false);
          }}
          onCancel={() => setShowExpenseForm(false)}
        />
      )}
    </div>
  );

  const renderIngredients = () => (
    <div className="section-container">
      {!showIngredientForm ? (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button className="btn btn-primary" onClick={() => setShowIngredientForm(true)}>
              Nuevo Insumo
            </button>
          </div>
          <div className="product-list">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Unidad</th>
                  <th>Stock</th>
                  <th>Stock Mínimo</th>
                  <th>Costo por Unidad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <h3>No hay insumos</h3>
                        <p>Crea tu primer insumo para comenzar</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  ingredients.map((ingredient) => (
                    <tr key={ingredient.id}>
                      <td>{ingredient.name}</td>
                      <td>{ingredient.unit}</td>
                      <td>{ingredient.stock.toFixed(2)}</td>
                      <td>{ingredient.minStock.toFixed(2)}</td>
                      <td>{formatCurrency(ingredient.cost)}</td>
                      <td>
                        <span
                          className={`stock-badge ${getStockBadgeClass(
                            ingredient.stock,
                            ingredient.minStock
                          )}`}
                        >
                          {ingredient.stock <= ingredient.minStock
                            ? 'Stock Bajo'
                            : ingredient.stock <= ingredient.minStock * 2
                              ? 'Stock Medio'
                              : 'Stock Alto'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            setSelectedIngredientId(ingredient.id);
                            setShowIngredientForm(true);
                          }}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div>
          <button className="btn btn-secondary" onClick={() => {
            setShowIngredientForm(false);
            setSelectedIngredientId(null);
          }}>
            ← Volver
          </button>
          <IngredientForm
            initialData={selectedIngredientId ? ingredients.find(i => i.id === selectedIngredientId) : undefined}
            onSubmit={async (data) => {
              if (selectedIngredientId) {
                await editIngredient(selectedIngredientId, data);
              } else {
                await createIngredient(data);
              }
              setShowIngredientForm(false);
              setSelectedIngredientId(null);
            }}
            onCancel={() => {
              setShowIngredientForm(false);
              setSelectedIngredientId(null);
            }}
          />
        </div>
      )}
    </div>
  );

  const renderProductIngredients = () => {
    if (selectedProductId === null) {
      return (
        <div className="section-container">
          <h2>Selecciona un Producto</h2>
          <div className="product-list">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state">
                        <h3>No hay productos</h3>
                        <p>Crea productos primero</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{formatCurrency(product.price)}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-small"
                          onClick={() => setSelectedProductId(product.id)}
                        >
                          Editar Insumos
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    const product = products.find((p) => p.id === selectedProductId);
    const currentProductIngredients = productIngredients.filter(
      (pi) => pi.productId === selectedProductId
    );

    if (!product) {
      return <div>Producto no encontrado</div>;
    }

    return (
      <div style={{ padding: '24px' }}>
        <button
          className="btn btn-secondary"
          onClick={() => setSelectedProductId(null)}
          style={{ marginBottom: '20px' }}
        >
          ← Volver
        </button>

        <div style={{ marginBottom: '32px' }}>
          <h2>{product.name}</h2>
          <p style={{ color: '#666', margin: '8px 0' }}>
            Precio: {formatCurrency(product.price)} | Categoría: {product.category}
          </p>
        </div>

        <ProductIngredients
          ingredients={ingredients}
          productIngredients={currentProductIngredients}
          onAddIngredient={async (ingredientId, quantity) => {
            await linkIngredientToProduct(selectedProductId, ingredientId, quantity);
          }}
          onRemoveIngredient={async (productIngredientId) => {
            await removeIngredientFromProduct(productIngredientId);
          }}
        />
      </div>
    );
  };

  const renderWorkers = () => (
    <div className="section-container">
      {!showWorkerForm ? (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button className="btn btn-primary" onClick={() => setShowWorkerForm(true)}>
              Nuevo Trabajador
            </button>
          </div>
          <WorkerList
            workers={workers}
            onToggleActive={async (workerId, active) => {
              await toggleWorkerActive(workerId, active);
            }}
          />
        </>
      ) : (
        <div>
          <button className="btn btn-secondary" onClick={() => setShowWorkerForm(false)}>
            ← Volver
          </button>
          <WorkerForm
            onSubmit={async (workerData) => {
              await createWorker(workerData);
              setShowWorkerForm(false);
            }}
          />
        </div>
      )}
    </div>
  );

  const renderEarnings = () => (
    <div className="section-container">
      {!showManualPaymentForm ? (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button
              className="btn btn-primary"
              onClick={() => setShowManualPaymentForm(true)}
            >
              + Agregar Pago Manual
            </button>
          </div>
          <WorkerEarningsReport
            earnings={workerEarnings}
            onPayWorker={async (workerId, amount) => {
              await payWorker(workerId, amount);
            }}
          />
        </>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowManualPaymentForm(false)}
            >
              ← Volver
            </button>
          </div>
          <ManualWorkerPaymentForm
            workers={workers}
            onSubmit={async (payment) => {
              await createManualWorkerPayment(payment);
              setShowManualPaymentForm(false);
            }}
            onCancel={() => setShowManualPaymentForm(false)}
            userId="current-user"
          />
        </>
      )}
    </div>
  );

  const renderProfits = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return (
      <div className="section-container">
        {profitReport && (
          <ProfitReportView
            report={profitReport}
            dateRange={{ start: today, end: tomorrow }}
          />
        )}
      </div>
    );
  };

  const renderPromotions = () => (
    <div className="section-container">
      {!showPromotionForm ? (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button className="btn btn-primary" onClick={() => setShowPromotionForm(true)}>
              Nueva Promoción
            </button>
          </div>
          <PromotionList
            promotions={promotions}
            onToggleActive={async (promotionId, active) => {
              await togglePromotionActive(promotionId, active);
            }}
            onDelete={async (promotionId) => {
              await deletePromotion(promotionId);
            }}
          />
        </>
      ) : (
        <div>
          <button className="btn btn-secondary" onClick={() => setShowPromotionForm(false)}>
            ← Volver
          </button>
          <PromotionForm
            products={products}
            onSubmit={async (promotionData) => {
              await createPromotion(promotionData);
              setShowPromotionForm(false);
            }}
            onCancel={() => setShowPromotionForm(false)}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard de Contabilidad</h1>
        <p>Panel de control para gestión de negocio</p>
      </div>

      <div className="dashboard-tabs">
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Resumen
          </button>
          <button
            className={`tab-button ${activeTab === 'cash' ? 'active' : ''}`}
            onClick={() => setActiveTab('cash')}
          >
            Caja
          </button>
          <button
            className={`tab-button ${activeTab === 'cash-history' ? 'active' : ''}`}
            onClick={() => setActiveTab('cash-history')}
          >
            Historial Caja
          </button>
          <button
            className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Productos
          </button>
          <button
            className={`tab-button ${activeTab === 'ingredients' ? 'active' : ''}`}
            onClick={() => setActiveTab('ingredients')}
          >
            Insumos
          </button>
          <button
            className={`tab-button ${activeTab === 'product-ingredients' ? 'active' : ''}`}
            onClick={() => setActiveTab('product-ingredients')}
          >
            Vincular Insumos
          </button>
          <button
            className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventario
          </button>
          <button
            className={`tab-button ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sales')}
          >
            Ventas
          </button>
          <button
            className={`tab-button ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            Gastos
          </button>
          <button
            className={`tab-button ${activeTab === 'promotions' ? 'active' : ''}`}
            onClick={() => setActiveTab('promotions')}
          >
            Promociones
          </button>
          <button
            className={`tab-button ${activeTab === 'workers' ? 'active' : ''}`}
            onClick={() => setActiveTab('workers')}
          >
            Trabajadores
          </button>
          <button
            className={`tab-button ${activeTab === 'earnings' ? 'active' : ''}`}
            onClick={() => setActiveTab('earnings')}
          >
            Pagos Personal
          </button>
          <button
            className={`tab-button ${activeTab === 'profits' ? 'active' : ''}`}
            onClick={() => setActiveTab('profits')}
          >
            Ganancias
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'ingredients' && renderIngredients()}
          {activeTab === 'product-ingredients' && renderProductIngredients()}
          {activeTab === 'inventory' && renderInventory()}
          {activeTab === 'sales' && renderSales()}
          {activeTab === 'cash' && renderCash()}
          {activeTab === 'cash-history' && renderCashHistory()}
          {activeTab === 'expenses' && renderExpenses()}
          {activeTab === 'promotions' && renderPromotions()}
          {activeTab === 'workers' && renderWorkers()}
          {activeTab === 'earnings' && renderEarnings()}
          {activeTab === 'profits' && renderProfits()}
        </div>
      </div>
    </div>
  );
};
