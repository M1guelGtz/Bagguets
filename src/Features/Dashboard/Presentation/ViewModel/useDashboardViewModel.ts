import { useEffect, useState } from 'react';
import { LocalStorageCashRegisterRepository } from '../../Data/Repository/LocalStorageCashRegisterRepository';
import { LocalStorageExpenseRepository } from '../../Data/Repository/LocalStorageExpenseRepository';
import { LocalStorageIngredientMovementRepository } from '../../Data/Repository/LocalStorageIngredientMovementRepository';
import { LocalStorageIngredientRepository } from '../../Data/Repository/LocalStorageIngredientRepository';
import { LocalStorageInventoryRepository } from '../../Data/Repository/LocalStorageInventoryRepository';
import { LocalStorageProductIngredientRepository } from '../../Data/Repository/LocalStorageProductIngredientRepository';
import { LocalStorageProductRepository } from '../../Data/Repository/LocalStorageProductRepository';
import { LocalStoragePromotionRepository } from '../../Data/Repository/LocalStoragePromotionRepository';
import { LocalStorageSaleRepository } from '../../Data/Repository/LocalStorageSaleRepository';
import { LocalStorageWorkerParticipationRepository } from '../../Data/Repository/LocalStorageWorkerParticipationRepository';
import { LocalStorageWorkerPaymentRepository } from '../../Data/Repository/LocalStorageWorkerPaymentRepository';
import { LocalStorageWorkerRepository } from '../../Data/Repository/LocalStorageWorkerRepository';
import { CashRegister } from '../../Domain/Entities/CashRegister';
import { Expense } from '../../Domain/Entities/Expense';
import { Ingredient } from '../../Domain/Entities/Ingredient';
import { MovementType } from '../../Domain/Entities/InventoryMovement';
import { Product } from '../../Domain/Entities/Product';
import { ProductIngredient } from '../../Domain/Entities/ProductIngredient';
import { Promotion } from '../../Domain/Entities/Promotion';
import { Sale } from '../../Domain/Entities/Sale';
import { Worker } from '../../Domain/Entities/Worker';
import { AddInventoryUseCase } from '../../Domain/UseCases/AddInventoryUseCase';
import { AssignWorkersToSaleUseCase } from '../../Domain/UseCases/AssignWorkersToSaleUseCase';
import { CheckProductAvailabilityUseCase, ProductAvailability } from '../../Domain/UseCases/CheckProductAvailabilityUseCase';
import { CloseCashRegisterUseCase } from '../../Domain/UseCases/CloseCashRegisterUseCase';
import { ConsumeIngredientsUseCase } from '../../Domain/UseCases/ConsumeIngredientsUseCase';
import { CreateExpenseUseCase } from '../../Domain/UseCases/CreateExpenseUseCase';
import { CreateIngredientUseCase } from '../../Domain/UseCases/CreateIngredientUseCase';
import { CreateProductUseCase } from '../../Domain/UseCases/CreateProductUseCase';
import { CreatePromotionUseCase } from '../../Domain/UseCases/CreatePromotionUseCase';
import { CreateSaleUseCase } from '../../Domain/UseCases/CreateSaleUseCase';
import { CreateWorkerUseCase } from '../../Domain/UseCases/CreateWorkerUseCase';
import { GetProfitReportUseCase, ProfitReport } from '../../Domain/UseCases/GetProfitReportUseCase';
import { GetSalesGrowthUseCase, SalesGrowth } from '../../Domain/UseCases/GetSalesGrowthUseCase';
import { GetWorkerEarningsUseCase, WorkerEarnings } from '../../Domain/UseCases/GetWorkerEarningsUseCase';
import { LinkIngredientToProductUseCase } from '../../Domain/UseCases/LinkIngredientToProductUseCase';
import { OpenCashRegisterUseCase } from '../../Domain/UseCases/OpenCashRegisterUseCase';
import { PayWorkerUseCase } from '../../Domain/UseCases/PayWorkerUseCase';

export const useDashboardViewModel = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [productIngredients, setProductIngredients] = useState<ProductIngredient[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [productAvailabilities, setProductAvailabilities] = useState<ProductAvailability[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workerEarnings, setWorkerEarnings] = useState<WorkerEarnings[]>([]);
  const [profitReport, setProfitReport] = useState<ProfitReport | null>(null);
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);
  const [todaySales, setTodaySales] = useState<Sale[]>([]);
  const [todayExpenses, setTodayExpenses] = useState<Expense[]>([]);
  const [salesGrowth, setSalesGrowth] = useState<SalesGrowth | null>(null);
  const [loading, setLoading] = useState(true);

  // Repositories
  const productRepository = new LocalStorageProductRepository();
  const ingredientRepository = new LocalStorageIngredientRepository();
  const productIngredientRepository = new LocalStorageProductIngredientRepository();
  const ingredientMovementRepository = new LocalStorageIngredientMovementRepository();
  const inventoryRepository = new LocalStorageInventoryRepository();
  const saleRepository = new LocalStorageSaleRepository();
  const cashRegisterRepository = new LocalStorageCashRegisterRepository();
  const expenseRepository = new LocalStorageExpenseRepository();
  const promotionRepository = new LocalStoragePromotionRepository();
  const workerRepository = new LocalStorageWorkerRepository();
  const workerParticipationRepository = new LocalStorageWorkerParticipationRepository();
  const workerPaymentRepository = new LocalStorageWorkerPaymentRepository();

  // Use Cases
  const createProductUseCase = new CreateProductUseCase(productRepository);
  const createIngredientUseCase = new CreateIngredientUseCase(ingredientRepository);
  const linkIngredientUseCase = new LinkIngredientToProductUseCase(
    productIngredientRepository,
    productRepository,
    ingredientRepository
  );
  const addInventoryUseCase = new AddInventoryUseCase(inventoryRepository, productRepository);
  const consumeIngredientsUseCase = new ConsumeIngredientsUseCase(
    ingredientRepository,
    ingredientMovementRepository
  );
  const assignWorkersUseCase = new AssignWorkersToSaleUseCase(
    workerParticipationRepository,
    workerRepository
  );
  const checkProductAvailabilityUseCase = new CheckProductAvailabilityUseCase(
    productRepository,
    ingredientRepository,
    productIngredientRepository
  );
  const createSaleUseCase = new CreateSaleUseCase(
    saleRepository,
    productRepository,
    cashRegisterRepository,
    productIngredientRepository,
    promotionRepository,
    consumeIngredientsUseCase,
    assignWorkersUseCase,
    checkProductAvailabilityUseCase
  );
  const openCashRegisterUseCase = new OpenCashRegisterUseCase(cashRegisterRepository);
  const closeCashRegisterUseCase = new CloseCashRegisterUseCase(cashRegisterRepository);
  const createExpenseUseCase = new CreateExpenseUseCase(expenseRepository, cashRegisterRepository);
  const getSalesGrowthUseCase = new GetSalesGrowthUseCase(saleRepository);
  const createWorkerUseCase = new CreateWorkerUseCase(workerRepository);
  const getWorkerEarningsUseCase = new GetWorkerEarningsUseCase(
    workerParticipationRepository,
    workerPaymentRepository
  );
  const payWorkerUseCase = new PayWorkerUseCase(
    workerParticipationRepository,
    workerPaymentRepository
  );
  const getProfitReportUseCase = new GetProfitReportUseCase(
    saleRepository,
    expenseRepository,
    workerParticipationRepository,
    productRepository
  );
  const createPromotionUseCase = new CreatePromotionUseCase(
    promotionRepository,
    productRepository
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        productsData,
        ingredientsData,
        productIngredientsData,
        promotionsData,
        workersData,
        earningsData,
        cashData,
        salesData,
        expensesData,
        growthData,
      ] = await Promise.all([
        productRepository.getAll(),
        ingredientRepository.getAll(),
        productIngredientRepository.getAll(),
        promotionRepository.getAll(),
        workerRepository.getAll(),
        getWorkerEarningsUseCase.execute(),
        cashRegisterRepository.getCurrent(),
        saleRepository.getTodaySales(),
        expenseRepository.getTodayExpenses(),
        getSalesGrowthUseCase.execute(),
      ]);

      setProducts(productsData);
      setIngredients(ingredientsData);
      setProductIngredients(productIngredientsData);
      setPromotions(promotionsData);
      setWorkers(workersData);
      setWorkerEarnings(earningsData);
      setCashRegister(cashData);
      setTodaySales(salesData);
      setTodayExpenses(expensesData);
      setSalesGrowth(growthData);

      // Calcular disponibilidad de productos basada en insumos
      const availabilities = await checkProductAvailabilityUseCase.execute();
      setProductAvailabilities(availabilities);

      // Calcular reporte de ganancias para hoy
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const profitData = await getProfitReportUseCase.execute(today, tomorrow);
      setProfitReport(profitData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createProduct = async (
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    await createProductUseCase.execute(productData);
    await loadData();
  };

  const createIngredient = async (
    ingredientData: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    await createIngredientUseCase.execute(ingredientData);
    await loadData();
  };

  const createPromotion = async (
    promotionData: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt' | 'productName'>
  ) => {
    const product = products.find(p => p.id === promotionData.productId);
    const promotionWithName = {
      ...promotionData,
      productName: product?.name || 'Unknown'
    };
    await createPromotionUseCase.execute(promotionWithName as any);
    await loadData();
  };

  const togglePromotionActive = async (promotionId: string, active: boolean) => {
    const promotion = await promotionRepository.getById(promotionId);
    if (promotion) {
      promotion.active = active;
      promotion.updatedAt = new Date();
      await promotionRepository.update(promotion);
      await loadData();
    }
  };

  const deletePromotion = async (promotionId: string) => {
    await promotionRepository.delete(promotionId);
    await loadData();
  };

  const linkIngredientToProduct = async (
    productId: string,
    ingredientId: string,
    quantity: number
  ) => {
    await linkIngredientUseCase.execute(productId, ingredientId, quantity);
    await loadData();
  };

  const removeIngredientFromProduct = async (productIngredientId: string) => {
    await productIngredientRepository.delete(productIngredientId);
    await loadData();
  };

  const addInventory = async (
    productId: string,
    quantity: number,
    type: MovementType,
    reason: string
  ) => {
    await addInventoryUseCase.execute(productId, quantity, type, reason, 'current-user');
    await loadData();
  };

  const createSale = async (
    items: Array<{ productId: string; quantity: number; promotionId?: string }>,
    paymentMethod: 'CASH' | 'CARD' | 'TRANSFER',
    cookId?: string,
    deliveryId?: string,
    notes?: string
  ) => {
    await createSaleUseCase.execute(items, paymentMethod, 'current-user', cookId, deliveryId, notes);
    await loadData();
  };

  const createWorker = async (workerData: Omit<Worker, 'id' | 'createdAt' | 'updatedAt'>) => {
    await createWorkerUseCase.execute(workerData);
    await loadData();
  };

  const toggleWorkerActive = async (workerId: string, active: boolean) => {
    const worker = await workerRepository.getById(workerId);
    if (worker) {
      worker.active = active;
      worker.updatedAt = new Date();
      await workerRepository.update(worker);
      await loadData();
    }
  };

  const payWorker = async (workerId: string, amount: number) => {
    await payWorkerUseCase.execute(workerId, amount, 'current-user');
    await loadData();
  };

  const getProfitReportForPeriod = async (startDate: Date, endDate: Date) => {
    return await getProfitReportUseCase.execute(startDate, endDate);
  };

  const openCashRegister = async (openingBalance: number) => {
    await openCashRegisterUseCase.execute(openingBalance, 'current-user');
    await loadData();
  };

  const closeCashRegister = async (actualBalance: number, notes?: string) => {
    await closeCashRegisterUseCase.execute(actualBalance, notes);
    await loadData();
  };

  const createExpense = async (
    description: string,
    amount: number,
    category: Expense['category'],
    notes?: string
  ) => {
    await createExpenseUseCase.execute(description, amount, category, 'current-user', notes);
    await loadData();
  };

  const getTodayTotals = () => {
    const totalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const totalExpenses = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netBalance = totalSales - totalExpenses;

    return { totalSales, totalExpenses, netBalance };
  };

  return {
    // State
    products,
    ingredients,
    productIngredients,
    promotions,
    productAvailabilities,
    workers,
    workerEarnings,
    profitReport,
    cashRegister,
    todaySales,
    todayExpenses,
    salesGrowth,
    loading,

    // Actions
    createProduct,
    createIngredient,
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
    getProfitReportForPeriod,
    openCashRegister,
    closeCashRegister,
    createExpense,
    getTodayTotals,
    reload: loadData,
  };
};
