import "server-only";
import {
  MasterDataRepository, InventoryRepository, OperationsRepository,
  SalesAndFinanceRepository, AuditLogRepository
} from "../contracts/erp.repositories";
import {
  ProductMasterDTO, MaterialMasterDTO, SupplierDTO, CustomerDTO, QcDefectCategoryDTO,
  StockBalanceDTO, InventoryMovementDTO, MaterialReceiptDTO, ProductionOrderDTO,
  QcInspectionDTO, StockTransferDTO, SaleDTO, PaymentDTO, MonthlySalaryDTO,
  AuditLogDTO, StockLocationCode, SalesChannel
} from "@/types/dto";
import { PaginatedQuery, PaginatedResult } from "@/types/pagination";
import { getMockStore, simulateMockNetwork } from "@/mocks/store";
import { AppError } from "@/lib/errors";

function paginate<T>(items: T[], query: PaginatedQuery): PaginatedResult<T> {
  const total = items.length;
  const page = Math.max(1, query.page || 1);
  const pageSize = Math.max(1, query.pageSize || 10);
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total, page, pageSize };
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

export class MockMasterDataRepository implements MasterDataRepository {
  async listProducts(query: PaginatedQuery<{ onlineChannel?: string; isActive?: boolean }>): Promise<PaginatedResult<ProductMasterDTO>> {
    await simulateMockNetwork();
    let rows = [...getMockStore().products];
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = rows.filter((p) => p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (query.filters?.onlineChannel) rows = rows.filter((p) => p.onlineChannel === query.filters?.onlineChannel);
    if (typeof query.filters?.isActive === "boolean") rows = rows.filter((p) => p.isActive === query.filters?.isActive);
    return paginate(rows, query);
  }

  async getProductById(id: string): Promise<ProductMasterDTO | null> {
    await simulateMockNetwork();
    return getMockStore().products.find((p) => p.id === id) ?? null;
  }

  async createProduct(data: Omit<ProductMasterDTO, "id" | "createdAt">): Promise<ProductMasterDTO> {
    await simulateMockNetwork();
    const item: ProductMasterDTO = { ...data, id: genId("prd"), createdAt: new Date().toISOString() };
    getMockStore().products.unshift(item);
    return item;
  }

  async updateProduct(id: string, data: Partial<ProductMasterDTO>): Promise<ProductMasterDTO> {
    await simulateMockNetwork();
    const list = getMockStore().products;
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) throw new AppError("NOT_FOUND", "Produk tidak ditemukan.");
    list[idx] = { ...list[idx], ...data };
    return list[idx];
  }

  async listMaterials(query: PaginatedQuery<{ materialType?: string; isActive?: boolean }>): Promise<PaginatedResult<MaterialMasterDTO>> {
    await simulateMockNetwork();
    let rows = [...getMockStore().materials];
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = rows.filter((m) => m.code.toLowerCase().includes(q) || m.name.toLowerCase().includes(q));
    }
    if (query.filters?.materialType) rows = rows.filter((m) => m.materialType === query.filters?.materialType);
    if (typeof query.filters?.isActive === "boolean") rows = rows.filter((m) => m.isActive === query.filters?.isActive);
    return paginate(rows, query);
  }

  async getMaterialById(id: string): Promise<MaterialMasterDTO | null> {
    await simulateMockNetwork();
    return getMockStore().materials.find((m) => m.id === id) ?? null;
  }

  async createMaterial(data: Omit<MaterialMasterDTO, "id" | "createdAt">): Promise<MaterialMasterDTO> {
    await simulateMockNetwork();
    const item: MaterialMasterDTO = { ...data, id: genId("mat"), createdAt: new Date().toISOString() };
    getMockStore().materials.unshift(item);
    return item;
  }

  async updateMaterial(id: string, data: Partial<MaterialMasterDTO>): Promise<MaterialMasterDTO> {
    await simulateMockNetwork();
    const list = getMockStore().materials;
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) throw new AppError("NOT_FOUND", "Bahan tidak ditemukan.");
    list[idx] = { ...list[idx], ...data };
    return list[idx];
  }

  async listSuppliers(query: PaginatedQuery): Promise<PaginatedResult<SupplierDTO>> {
    await simulateMockNetwork();
    let rows = [...getMockStore().suppliers];
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = rows.filter((s) => s.name.toLowerCase().includes(q) || s.contact.toLowerCase().includes(q));
    }
    return paginate(rows, query);
  }

  async createSupplier(data: Omit<SupplierDTO, "id">): Promise<SupplierDTO> {
    await simulateMockNetwork();
    const item: SupplierDTO = { ...data, id: genId("sup") };
    getMockStore().suppliers.unshift(item);
    return item;
  }

  async updateSupplier(id: string, data: Partial<SupplierDTO>): Promise<SupplierDTO> {
    await simulateMockNetwork();
    const list = getMockStore().suppliers;
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) throw new AppError("NOT_FOUND", "Supplier tidak ditemukan.");
    list[idx] = { ...list[idx], ...data };
    return list[idx];
  }

  async listCustomers(query: PaginatedQuery): Promise<PaginatedResult<CustomerDTO>> {
    await simulateMockNetwork();
    let rows = [...getMockStore().customers];
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = rows.filter((c) => c.name.toLowerCase().includes(q) || c.contact.toLowerCase().includes(q));
    }
    return paginate(rows, query);
  }

  async createCustomer(data: Omit<CustomerDTO, "id">): Promise<CustomerDTO> {
    await simulateMockNetwork();
    const item: CustomerDTO = { ...data, id: genId("cus") };
    getMockStore().customers.unshift(item);
    return item;
  }

  async updateCustomer(id: string, data: Partial<CustomerDTO>): Promise<CustomerDTO> {
    await simulateMockNetwork();
    const list = getMockStore().customers;
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new AppError("NOT_FOUND", "Pelanggan tidak ditemukan.");
    list[idx] = { ...list[idx], ...data };
    return list[idx];
  }

  async listQcDefectCategories(): Promise<QcDefectCategoryDTO[]> {
    await simulateMockNetwork();
    return [...getMockStore().qcDefectCategories];
  }

  async createQcDefectCategory(name: string): Promise<QcDefectCategoryDTO> {
    await simulateMockNetwork();
    const item: QcDefectCategoryDTO = { id: genId("qcd"), name, isActive: true };
    getMockStore().qcDefectCategories.push(item);
    return item;
  }

  async toggleQcDefectCategory(id: string, isActive: boolean): Promise<QcDefectCategoryDTO> {
    await simulateMockNetwork();
    const found = getMockStore().qcDefectCategories.find((q) => q.id === id);
    if (!found) throw new AppError("NOT_FOUND", "Kategori cacat QC tidak ditemukan.");
    found.isActive = isActive;
    return found;
  }
}

export class MockInventoryRepository implements InventoryRepository {
  async listBalances(query: PaginatedQuery<{ locationCode?: StockLocationCode; itemType?: "MATERIAL" | "PRODUCT"; onlineChannel?: string }>): Promise<PaginatedResult<StockBalanceDTO>> {
    await simulateMockNetwork();
    let rows = [...getMockStore().stockBalances];
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = rows.filter((b) => b.itemCode.toLowerCase().includes(q) || b.itemName.toLowerCase().includes(q));
    }
    if (query.filters?.locationCode) rows = rows.filter((b) => b.locationCode === query.filters?.locationCode);
    if (query.filters?.itemType) rows = rows.filter((b) => b.itemType === query.filters?.itemType);
    if (query.filters?.onlineChannel) rows = rows.filter((b) => b.onlineChannel === query.filters?.onlineChannel);
    return paginate(rows, query);
  }

  async getBalance(itemType: "MATERIAL" | "PRODUCT", itemId: string, locationCode: StockLocationCode): Promise<StockBalanceDTO | null> {
    return getMockStore().stockBalances.find(
      (b) => b.itemType === itemType && b.itemId === itemId && b.locationCode === locationCode
    ) ?? null;
  }

  async upsertBalanceDelta(params: {
    itemType: "MATERIAL" | "PRODUCT";
    itemId: string;
    itemCode: string;
    itemName: string;
    unit: string;
    locationCode: StockLocationCode;
    deltaPhysical: number;
    minStock: number;
    onlineChannel?: "ONLINE_A" | "ONLINE_B" | "NONE";
  }): Promise<StockBalanceDTO> {
    const list = getMockStore().stockBalances;
    let found = list.find(
      (b) => b.itemType === params.itemType && b.itemId === params.itemId && b.locationCode === params.locationCode
    );
    if (!found) {
      found = {
        id: genId("stk"),
        itemType: params.itemType,
        itemId: params.itemId,
        itemCode: params.itemCode,
        itemName: params.itemName,
        unit: params.unit,
        locationCode: params.locationCode,
        physicalQty: 0,
        allocatedQty: 0,
        availableQty: 0,
        minStock: params.minStock,
        onlineChannel: params.onlineChannel,
      };
      list.push(found);
    }
    found.physicalQty += params.deltaPhysical;
    found.availableQty = found.physicalQty - found.allocatedQty;
    return { ...found };
  }

  async appendMovement(movement: Omit<InventoryMovementDTO, "id">): Promise<InventoryMovementDTO> {
    const item: InventoryMovementDTO = { ...movement, id: genId("mov") };
    getMockStore().movements.unshift(item);
    return item;
  }

  async listMovements(query: PaginatedQuery<{ locationCode?: StockLocationCode; itemId?: string }>): Promise<PaginatedResult<InventoryMovementDTO>> {
    await simulateMockNetwork();
    let rows = [...getMockStore().movements];
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = rows.filter((m) => m.refNumber.toLowerCase().includes(q) || m.itemName.toLowerCase().includes(q) || m.itemCode.toLowerCase().includes(q));
    }
    if (query.filters?.locationCode) rows = rows.filter((m) => m.locationCode === query.filters?.locationCode);
    if (query.filters?.itemId) rows = rows.filter((m) => m.itemId === query.filters?.itemId);
    return paginate(rows, query);
  }
}

export class MockOperationsRepository implements OperationsRepository {
  async listReceipts(query: PaginatedQuery): Promise<PaginatedResult<MaterialReceiptDTO>> {
    await simulateMockNetwork();
    let rows = [...getMockStore().materialReceipts];
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = rows.filter((r) => r.receiptNumber.toLowerCase().includes(q) || r.supplierName.toLowerCase().includes(q) || r.materialName.toLowerCase().includes(q));
    }
    return paginate(rows, query);
  }

  async createReceipt(data: Omit<MaterialReceiptDTO, "id">): Promise<MaterialReceiptDTO> {
    const item: MaterialReceiptDTO = { ...data, id: genId("gr") };
    getMockStore().materialReceipts.unshift(item);
    return item;
  }

  async listProductions(query: PaginatedQuery<{ qcCompleted?: boolean }>): Promise<PaginatedResult<ProductionOrderDTO>> {
    await simulateMockNetwork();
    let rows = [...getMockStore().productionOrders];
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = rows.filter((p) => p.productionNumber.toLowerCase().includes(q) || p.batchCode.toLowerCase().includes(q) || p.productName.toLowerCase().includes(q));
    }
    if (typeof query.filters?.qcCompleted === "boolean") {
      rows = rows.filter((p) => p.qcCompleted === query.filters?.qcCompleted);
    }
    return paginate(rows, query);
  }

  async getProductionById(id: string): Promise<ProductionOrderDTO | null> {
    return getMockStore().productionOrders.find((p) => p.id === id) ?? null;
  }

  async createProduction(data: Omit<ProductionOrderDTO, "id">): Promise<ProductionOrderDTO> {
    const item: ProductionOrderDTO = { ...data, id: genId("prd-ord") };
    getMockStore().productionOrders.unshift(item);
    return item;
  }

  async markProductionQcCompleted(id: string): Promise<void> {
    const found = getMockStore().productionOrders.find((p) => p.id === id);
    if (found) found.qcCompleted = true;
  }

  async listQcInspections(query: PaginatedQuery): Promise<PaginatedResult<QcInspectionDTO>> {
    await simulateMockNetwork();
    let rows = [...getMockStore().qcInspections];
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = rows.filter((x) => x.qcNumber.toLowerCase().includes(q) || x.batchCode.toLowerCase().includes(q));
    }
    return paginate(rows, query);
  }

  async createQcInspection(data: Omit<QcInspectionDTO, "id">): Promise<QcInspectionDTO> {
    const item: QcInspectionDTO = { ...data, id: genId("qc") };
    getMockStore().qcInspections.unshift(item);
    return item;
  }

  async listTransfers(query: PaginatedQuery): Promise<PaginatedResult<StockTransferDTO>> {
    await simulateMockNetwork();
    let rows = [...getMockStore().stockTransfers];
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = rows.filter((t) => t.transferNumber.toLowerCase().includes(q) || t.productName.toLowerCase().includes(q));
    }
    return paginate(rows, query);
  }

  async createTransfer(data: Omit<StockTransferDTO, "id">): Promise<StockTransferDTO> {
    const item: StockTransferDTO = { ...data, id: genId("trf") };
    getMockStore().stockTransfers.unshift(item);
    return item;
  }
}

export class MockSalesAndFinanceRepository implements SalesAndFinanceRepository {
  async listSales(query: PaginatedQuery<{ channel?: SalesChannel; paymentStatus?: string }>): Promise<PaginatedResult<SaleDTO>> {
    await simulateMockNetwork();
    let rows = [...getMockStore().sales];
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = rows.filter((s) => s.invoiceNumber.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q));
    }
    if (query.filters?.channel) rows = rows.filter((s) => s.channel === query.filters?.channel);
    if (query.filters?.paymentStatus) rows = rows.filter((s) => s.paymentStatus === query.filters?.paymentStatus);
    return paginate(rows, query);
  }

  async getSaleById(id: string): Promise<SaleDTO | null> {
    return getMockStore().sales.find((s) => s.id === id) ?? null;
  }

  async createSale(data: Omit<SaleDTO, "id">): Promise<SaleDTO> {
    const item: SaleDTO = { ...data, id: genId("sal") };
    getMockStore().sales.unshift(item);
    return item;
  }

  async updateSalePayment(saleId: string, paidAmount: number, remainingAmount: number, paymentStatus: SaleDTO["paymentStatus"]): Promise<SaleDTO> {
    const found = getMockStore().sales.find((s) => s.id === saleId);
    if (!found) throw new AppError("NOT_FOUND", "Faktur penjualan tidak ditemukan.");
    found.paidAmount = paidAmount;
    found.remainingAmount = remainingAmount;
    found.paymentStatus = paymentStatus;
    return { ...found };
  }

  async updateSaleOrderStatus(saleId: string, orderStatus: SaleDTO["orderStatus"]): Promise<SaleDTO> {
    const found = getMockStore().sales.find((s) => s.id === saleId);
    if (!found) throw new AppError("NOT_FOUND", "Pesanan tidak ditemukan.");
    found.orderStatus = orderStatus;
    return { ...found };
  }

  async listPayments(query: PaginatedQuery<{ channel?: SalesChannel }>): Promise<PaginatedResult<PaymentDTO>> {
    await simulateMockNetwork();
    let rows = [...getMockStore().payments];
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = rows.filter((p) => p.paymentNumber.toLowerCase().includes(q) || p.invoiceNumber.toLowerCase().includes(q) || p.customerName.toLowerCase().includes(q));
    }
    if (query.filters?.channel) rows = rows.filter((p) => p.channel === query.filters?.channel);
    return paginate(rows, query);
  }

  async createPayment(data: Omit<PaymentDTO, "id">): Promise<PaymentDTO> {
    const item: PaymentDTO = { ...data, id: genId("pay") };
    getMockStore().payments.unshift(item);
    return item;
  }

  async listMonthlySalaries(): Promise<MonthlySalaryDTO[]> {
    await simulateMockNetwork();
    return [...getMockStore().monthlySalaries];
  }

  async upsertMonthlySalary(data: Omit<MonthlySalaryDTO, "id">): Promise<MonthlySalaryDTO> {
    const list = getMockStore().monthlySalaries;
    const idx = list.findIndex((s) => s.monthKey === data.monthKey);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      return list[idx];
    }
    const created: MonthlySalaryDTO = { ...data, id: genId("sal-mon") };
    list.unshift(created);
    return created;
  }
}

export class MockAuditLogRepository implements AuditLogRepository {
  async appendLog(entry: Omit<AuditLogDTO, "id">): Promise<AuditLogDTO> {
    const log: AuditLogDTO = { ...entry, id: genId("aud") };
    getMockStore().auditLogs.unshift(log);
    return log;
  }

  async listLogs(query: PaginatedQuery<{ module?: string }>): Promise<PaginatedResult<AuditLogDTO>> {
    await simulateMockNetwork();
    let rows = [...getMockStore().auditLogs];
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = rows.filter((a) => a.actorName.toLowerCase().includes(q) || a.action.toLowerCase().includes(q) || a.module.toLowerCase().includes(q));
    }
    if (query.filters?.module) rows = rows.filter((a) => a.module === query.filters?.module);
    return paginate(rows, query);
  }
}
