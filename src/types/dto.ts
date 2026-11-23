export type UserRole = "BOSS" | "ADMIN_GUDANG" | "ADMIN_ONLINE_A" | "ADMIN_ONLINE_B";
export type OnlineChannel = "ONLINE_A" | "ONLINE_B" | "NONE";
export type SalesChannel = "OFFLINE" | "ONLINE_A" | "ONLINE_B";
export type DocumentStatus = "DRAFT" | "POSTED" | "CANCELLED";
export type StockLocationCode =
  | "GUDANG_BAHAN_BAKU"
  | "GUDANG_BAHAN_PELENGKAP"
  | "GUDANG_BARANG_JADI_OK"
  | "GUDANG_BARANG_NG"
  | "STOK_ONLINE_A"
  | "STOK_ONLINE_B";

export interface UserDTO {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface ProductMasterDTO {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  defaultPrice: number;
  minStock: number;
  onlineChannel: OnlineChannel;
  isActive: boolean;
  createdAt: string;
}

export interface MaterialMasterDTO {
  id: string;
  code: string;
  name: string;
  materialType: "BAHAN_BAKU" | "BAHAN_PELENGKAP";
  category: string;
  unit: string;
  minStock: number;
  isActive: boolean;
  createdAt: string;
}

export interface SupplierDTO {
  id: string;
  name: string;
  contact: string;
  address: string;
  notes?: string;
  isActive: boolean;
}

export interface CustomerDTO {
  id: string;
  name: string;
  contact: string;
  address: string;
  creditLimit?: number;
  notes?: string;
  isActive: boolean;
}

export interface QcDefectCategoryDTO {
  id: string;
  name: string;
  isActive: boolean;
}

export interface StockBalanceDTO {
  id: string;
  itemType: "MATERIAL" | "PRODUCT";
  itemId: string;
  itemCode: string;
  itemName: string;
  unit: string;
  locationCode: StockLocationCode;
  physicalQty: number;
  allocatedQty: number;
  availableQty: number;
  minStock: number;
  onlineChannel?: OnlineChannel;
}

export interface InventoryMovementDTO {
  id: string;
  movementDate: string;
  itemType: "MATERIAL" | "PRODUCT";
  itemId: string;
  itemCode: string;
  itemName: string;
  locationCode: StockLocationCode;
  direction: "IN" | "OUT";
  qty: number;
  balanceAfter: number;
  refType: "OPENING_BALANCE" | "MATERIAL_RECEIPT" | "MATERIAL_ISSUE" | "PRODUCTION" | "QC_APPROVAL" | "STOCK_TRANSFER" | "SALE" | "ADJUSTMENT" | "REVERSAL";
  refNumber: string;
  notes?: string;
  actorName: string;
}

export interface MaterialReceiptDTO {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  supplierId: string;
  supplierName: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  materialType: "BAHAN_BAKU" | "BAHAN_PELENGKAP";
  unit: string;
  qty: number;
  unitPrice: number;
  totalAmount: number;
  externalDocNumber: string;
  notes?: string;
  status: DocumentStatus;
  createdByName: string;
}

export interface ProductionMaterialUsageDTO {
  materialId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  qtyUsed: number;
}

export interface ProductionOrderDTO {
  id: string;
  productionNumber: string;
  productionDate: string;
  batchCode: string;
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  targetQty: number;
  actualQty: number;
  materialsUsed: ProductionMaterialUsageDTO[];
  picName: string;
  notes?: string;
  status: DocumentStatus;
  qcCompleted: boolean;
}

export interface QcInspectionDTO {
  id: string;
  qcNumber: string;
  inspectionDate: string;
  productionId: string;
  productionNumber: string;
  batchCode: string;
  productId: string;
  productCode: string;
  productName: string;
  inspectedQty: number;
  okQty: number;
  ngQty: number;
  defectCategoryId?: string;
  defectCategoryName?: string;
  inspectorName: string;
  notes?: string;
  status: DocumentStatus;
}

export interface StockTransferDTO {
  id: string;
  transferNumber: string;
  transferDate: string;
  fromLocation: StockLocationCode;
  toLocation: StockLocationCode;
  productId: string;
  productCode: string;
  productName: string;
  qty: number;
  picName: string;
  notes?: string;
  status: DocumentStatus;
}

export interface SaleItemDTO {
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleDTO {
  id: string;
  invoiceNumber: string;
  saleDate: string;
  channel: SalesChannel;
  customerId?: string;
  customerName: string;
  marketplaceOrderRef?: string;
  orderStatus: "PENDING" | "PACKED" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  items: SaleItemDTO[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  status: DocumentStatus;
  createdByName: string;
}

export interface PaymentDTO {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  saleId: string;
  invoiceNumber: string;
  customerName: string;
  channel: SalesChannel;
  amount: number;
  method: "TUNAI" | "TRANSFER_BANK" | "QRIS" | "MARKETPLACE_SETTLEMENT";
  notes?: string;
  recordedByName: string;
}

export interface MonthlySalaryDTO {
  id: string;
  monthKey: string; // YYYY-MM
  totalAmount: number;
  notes?: string;
  updatedAt: string;
  recordedByName: string;
}

export interface AuditLogDTO {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  module: string;
  action: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface ProfitReportRowDTO {
  periodLabel: string;
  totalSales: number;
  rawMaterialPayments: number;
  salaryExpense: number;
  netProfit: number;
}

export interface DashboardSummaryDTO {
  totalRawMaterialStock: number;
  totalAuxMaterialStock: number;
  totalFinishedOkStock: number;
  totalFinishedNgStock: number;
  totalOnlineAStock: number;
  totalOnlineBStock: number;
  lowStockCount: number;
  offlineSalesTotal: number;
  onlineASalesTotal: number;
  onlineBSalesTotal: number;
  totalReceivables: number;
  chartSeries: { label: string; masuk: number; keluar: number; penjualan: number }[];
}
