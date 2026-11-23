import {
  ProductMasterDTO, MaterialMasterDTO, SupplierDTO, CustomerDTO, QcDefectCategoryDTO,
  StockBalanceDTO, InventoryMovementDTO, MaterialReceiptDTO, ProductionOrderDTO,
  QcInspectionDTO, StockTransferDTO, SaleDTO, PaymentDTO, MonthlySalaryDTO,
  AuditLogDTO, StockLocationCode, SalesChannel
} from "@/types/dto";
import { PaginatedQuery, PaginatedResult } from "@/types/pagination";
import { TransactionContext } from "@/server/uow";

export interface MasterDataRepository {
  listProducts(query: PaginatedQuery<{ onlineChannel?: string; isActive?: boolean }>): Promise<PaginatedResult<ProductMasterDTO>>;
  getProductById(id: string): Promise<ProductMasterDTO | null>;
  createProduct(data: Omit<ProductMasterDTO, "id" | "createdAt">, tx?: TransactionContext): Promise<ProductMasterDTO>;
  updateProduct(id: string, data: Partial<ProductMasterDTO>, tx?: TransactionContext): Promise<ProductMasterDTO>;

  listMaterials(query: PaginatedQuery<{ materialType?: string; isActive?: boolean }>): Promise<PaginatedResult<MaterialMasterDTO>>;
  getMaterialById(id: string): Promise<MaterialMasterDTO | null>;
  createMaterial(data: Omit<MaterialMasterDTO, "id" | "createdAt">, tx?: TransactionContext): Promise<MaterialMasterDTO>;
  updateMaterial(id: string, data: Partial<MaterialMasterDTO>, tx?: TransactionContext): Promise<MaterialMasterDTO>;

  listSuppliers(query: PaginatedQuery): Promise<PaginatedResult<SupplierDTO>>;
  createSupplier(data: Omit<SupplierDTO, "id">, tx?: TransactionContext): Promise<SupplierDTO>;
  updateSupplier(id: string, data: Partial<SupplierDTO>, tx?: TransactionContext): Promise<SupplierDTO>;

  listCustomers(query: PaginatedQuery): Promise<PaginatedResult<CustomerDTO>>;
  createCustomer(data: Omit<CustomerDTO, "id">, tx?: TransactionContext): Promise<CustomerDTO>;
  updateCustomer(id: string, data: Partial<CustomerDTO>, tx?: TransactionContext): Promise<CustomerDTO>;

  listQcDefectCategories(): Promise<QcDefectCategoryDTO[]>;
  createQcDefectCategory(name: string, tx?: TransactionContext): Promise<QcDefectCategoryDTO>;
  toggleQcDefectCategory(id: string, isActive: boolean, tx?: TransactionContext): Promise<QcDefectCategoryDTO>;
}

export interface InventoryRepository {
  listBalances(query: PaginatedQuery<{ locationCode?: StockLocationCode; itemType?: "MATERIAL" | "PRODUCT"; onlineChannel?: string }>): Promise<PaginatedResult<StockBalanceDTO>>;
  getBalance(itemType: "MATERIAL" | "PRODUCT", itemId: string, locationCode: StockLocationCode): Promise<StockBalanceDTO | null>;
  upsertBalanceDelta(params: {
    itemType: "MATERIAL" | "PRODUCT";
    itemId: string;
    itemCode: string;
    itemName: string;
    unit: string;
    locationCode: StockLocationCode;
    deltaPhysical: number;
    minStock: number;
    onlineChannel?: "ONLINE_A" | "ONLINE_B" | "NONE";
  }, tx: TransactionContext): Promise<StockBalanceDTO>;
  appendMovement(movement: Omit<InventoryMovementDTO, "id">, tx: TransactionContext): Promise<InventoryMovementDTO>;
  listMovements(query: PaginatedQuery<{ locationCode?: StockLocationCode; itemId?: string }>): Promise<PaginatedResult<InventoryMovementDTO>>;
}

export interface OperationsRepository {
  listReceipts(query: PaginatedQuery): Promise<PaginatedResult<MaterialReceiptDTO>>;
  createReceipt(data: Omit<MaterialReceiptDTO, "id">, tx: TransactionContext): Promise<MaterialReceiptDTO>;

  listProductions(query: PaginatedQuery<{ qcCompleted?: boolean }>): Promise<PaginatedResult<ProductionOrderDTO>>;
  getProductionById(id: string): Promise<ProductionOrderDTO | null>;
  createProduction(data: Omit<ProductionOrderDTO, "id">, tx: TransactionContext): Promise<ProductionOrderDTO>;
  markProductionQcCompleted(id: string, tx: TransactionContext): Promise<void>;

  listQcInspections(query: PaginatedQuery): Promise<PaginatedResult<QcInspectionDTO>>;
  createQcInspection(data: Omit<QcInspectionDTO, "id">, tx: TransactionContext): Promise<QcInspectionDTO>;

  listTransfers(query: PaginatedQuery): Promise<PaginatedResult<StockTransferDTO>>;
  createTransfer(data: Omit<StockTransferDTO, "id">, tx: TransactionContext): Promise<StockTransferDTO>;
}

export interface SalesAndFinanceRepository {
  listSales(query: PaginatedQuery<{ channel?: SalesChannel; paymentStatus?: string }>): Promise<PaginatedResult<SaleDTO>>;
  getSaleById(id: string): Promise<SaleDTO | null>;
  createSale(data: Omit<SaleDTO, "id">, tx: TransactionContext): Promise<SaleDTO>;
  updateSalePayment(saleId: string, paidAmount: number, remainingAmount: number, paymentStatus: SaleDTO["paymentStatus"], tx: TransactionContext): Promise<SaleDTO>;
  updateSaleOrderStatus(saleId: string, orderStatus: SaleDTO["orderStatus"], tx: TransactionContext): Promise<SaleDTO>;

  listPayments(query: PaginatedQuery<{ channel?: SalesChannel }>): Promise<PaginatedResult<PaymentDTO>>;
  createPayment(data: Omit<PaymentDTO, "id">, tx: TransactionContext): Promise<PaymentDTO>;

  listMonthlySalaries(): Promise<MonthlySalaryDTO[]>;
  upsertMonthlySalary(data: Omit<MonthlySalaryDTO, "id">, tx: TransactionContext): Promise<MonthlySalaryDTO>;
}

export interface AuditLogRepository {
  appendLog(entry: Omit<AuditLogDTO, "id">, tx?: TransactionContext): Promise<AuditLogDTO>;
  listLogs(query: PaginatedQuery<{ module?: string }>): Promise<PaginatedResult<AuditLogDTO>>;
}
