import bcrypt from "bcryptjs";
import {
  UserDTO, ProductMasterDTO, MaterialMasterDTO, SupplierDTO, CustomerDTO,
  QcDefectCategoryDTO, StockBalanceDTO, InventoryMovementDTO, MaterialReceiptDTO,
  ProductionOrderDTO, QcInspectionDTO, StockTransferDTO, SaleDTO, PaymentDTO,
  MonthlySalaryDTO, AuditLogDTO
} from "@/types/dto";

export interface StoredUserRecord extends UserDTO {
  passwordHash: string;
}

const DEMO_PASSWORD_HASH = bcrypt.hashSync("Priangan2026!", 10);

export function createInitialSeedData() {
  const d1 = "2026-11-15T08:00:00.000Z";
  const d2 = "2026-11-18T10:30:00.000Z";
  const d3 = "2026-11-20T14:15:00.000Z";

  const users: StoredUserRecord[] = [
    { id: "usr-boss-01", name: "Hendra Wijaya (Boss)", username: "boss", email: "boss@priangansentosa.co.id", role: "BOSS", isActive: true, passwordHash: DEMO_PASSWORD_HASH, createdAt: d1 },
    { id: "usr-gudang-01", name: "Rizky Pratama (Admin Gudang)", username: "gudang", email: "gudang@priangansentosa.co.id", role: "ADMIN_GUDANG", isActive: true, passwordHash: DEMO_PASSWORD_HASH, createdAt: d1 },
    { id: "usr-online-a-01", name: "Siti Nurhaliza (Admin Online A)", username: "onlinea", email: "online.a@priangansentosa.co.id", role: "ADMIN_ONLINE_A", isActive: true, passwordHash: DEMO_PASSWORD_HASH, createdAt: d1 },
    { id: "usr-online-b-01", name: "Dedi Kurniawan (Admin Online B)", username: "onlineb", email: "online.b@priangansentosa.co.id", role: "ADMIN_ONLINE_B", isActive: true, passwordHash: DEMO_PASSWORD_HASH, createdAt: d1 },
  ];

  const products: ProductMasterDTO[] = [
    { id: "prd-001", code: "PRD-001", name: "Produk 1 — Keripik Tempe Original 250g", category: "Makanan Ringan", unit: "Pcs", defaultPrice: 18000, minStock: 100, onlineChannel: "ONLINE_A", isActive: true, createdAt: d1 },
    { id: "prd-002", code: "PRD-002", name: "Produk 2 — Keripik Tempe Pedas Daun Jeruk 250g", category: "Makanan Ringan", unit: "Pcs", defaultPrice: 20000, minStock: 100, onlineChannel: "ONLINE_A", isActive: true, createdAt: d1 },
    { id: "prd-003", code: "PRD-003", name: "Produk 3 — Basreng Pedas Ekstra 200g", category: "Makanan Ringan", unit: "Pcs", defaultPrice: 16500, minStock: 120, onlineChannel: "ONLINE_B", isActive: true, createdAt: d1 },
    { id: "prd-004", code: "PRD-004", name: "Produk 4 — Sale Pisang Crispy 300g", category: "Oleh-Oleh Khas", unit: "Box", defaultPrice: 25000, minStock: 80, onlineChannel: "ONLINE_B", isActive: true, createdAt: d1 },
  ];

  const materials: MaterialMasterDTO[] = [
    { id: "mat-001", code: "BHN-001", name: "Kedelai Kuning Pilihan", materialType: "BAHAN_BAKU", category: "Bahan Utama", unit: "Kg", minStock: 200, isActive: true, createdAt: d1 },
    { id: "mat-002", code: "BHN-002", name: "Minyak Goreng Sawit", materialType: "BAHAN_BAKU", category: "Bahan Utama", unit: "Liter", minStock: 150, isActive: true, createdAt: d1 },
    { id: "mat-003", code: "PLG-001", name: "Standing Pouch Aluminium Foil 250g", materialType: "BAHAN_PELENGKAP", category: "Kemasan", unit: "Pcs", minStock: 500, isActive: true, createdAt: d1 },
  ];

  const suppliers: SupplierDTO[] = [
    { id: "sup-001", name: "UD Sumber Kedelai Priangan", contact: "0812-2233-4455", address: "Jl. Raya Ciawi No. 45, Tasikmalaya", notes: "Pemasok utama kedelai lokal", isActive: true },
    { id: "sup-002", name: "CV Kemasan Nusantara", contact: "0821-9988-7766", address: "Jl. Soekarno Hatta No. 112, Bandung", notes: "Kemasan pouch & kardus", isActive: true },
  ];

  const customers: CustomerDTO[] = [
    { id: "cus-001", name: "Toko Oleh-Oleh Sari Rasa", contact: "0813-5566-7788", address: "Jl. HZ Mustofa No. 88, Tasikmalaya", creditLimit: 15000000, notes: "Pelanggan grosir rutin", isActive: true },
    { id: "cus-002", name: "Minimarket Berkah Jaya", contact: "0857-1122-3344", address: "Jl. Sutisna Senjaya No. 19, Tasikmalaya", creditLimit: 10000000, isActive: true },
  ];

  const qcDefectCategories: QcDefectCategoryDTO[] = [
    { id: "qcd-001", name: "Kemasan Bocor / Seal Rusak", isActive: true },
    { id: "qcd-002", name: "Produk Hancur / Remuk", isActive: true },
    { id: "qcd-003", name: "Tingkat Kematangan Tidak Sesuai", isActive: true },
  ];

  const stockBalances: StockBalanceDTO[] = [
    { id: "stk-1", itemType: "MATERIAL", itemId: "mat-001", itemCode: "BHN-001", itemName: "Kedelai Kuning Pilihan", unit: "Kg", locationCode: "GUDANG_BAHAN_BAKU", physicalQty: 650, allocatedQty: 0, availableQty: 650, minStock: 200 },
    { id: "stk-2", itemType: "MATERIAL", itemId: "mat-002", itemCode: "BHN-002", itemName: "Minyak Goreng Sawit", unit: "Liter", locationCode: "GUDANG_BAHAN_BAKU", physicalQty: 140, allocatedQty: 0, availableQty: 140, minStock: 150 },
    { id: "stk-3", itemType: "MATERIAL", itemId: "mat-003", itemCode: "PLG-001", itemName: "Standing Pouch Aluminium Foil 250g", unit: "Pcs", locationCode: "GUDANG_BAHAN_PELENGKAP", physicalQty: 1800, allocatedQty: 0, availableQty: 1800, minStock: 500 },
    { id: "stk-4", itemType: "PRODUCT", itemId: "prd-001", itemCode: "PRD-001", itemName: "Produk 1 — Keripik Tempe Original 250g", unit: "Pcs", locationCode: "GUDANG_BARANG_JADI_OK", physicalQty: 320, allocatedQty: 0, availableQty: 320, minStock: 100, onlineChannel: "ONLINE_A" },
    { id: "stk-5", itemType: "PRODUCT", itemId: "prd-002", itemCode: "PRD-002", itemName: "Produk 2 — Keripik Tempe Pedas Daun Jeruk 250g", unit: "Pcs", locationCode: "GUDANG_BARANG_JADI_OK", physicalQty: 260, allocatedQty: 0, availableQty: 260, minStock: 100, onlineChannel: "ONLINE_A" },
    { id: "stk-6", itemType: "PRODUCT", itemId: "prd-003", itemCode: "PRD-003", itemName: "Produk 3 — Basreng Pedas Ekstra 200g", unit: "Pcs", locationCode: "GUDANG_BARANG_JADI_OK", physicalQty: 290, allocatedQty: 0, availableQty: 290, minStock: 120, onlineChannel: "ONLINE_B" },
    { id: "stk-7", itemType: "PRODUCT", itemId: "prd-004", itemCode: "PRD-004", itemName: "Produk 4 — Sale Pisang Crispy 300g", unit: "Box", locationCode: "GUDANG_BARANG_JADI_OK", physicalQty: 190, allocatedQty: 0, availableQty: 190, minStock: 80, onlineChannel: "ONLINE_B" },
    { id: "stk-8", itemType: "PRODUCT", itemId: "prd-001", itemCode: "PRD-001", itemName: "Produk 1 — Keripik Tempe Original 250g", unit: "Pcs", locationCode: "GUDANG_BARANG_NG", physicalQty: 15, allocatedQty: 0, availableQty: 15, minStock: 0, onlineChannel: "ONLINE_A" },
    { id: "stk-9", itemType: "PRODUCT", itemId: "prd-001", itemCode: "PRD-001", itemName: "Produk 1 — Keripik Tempe Original 250g", unit: "Pcs", locationCode: "STOK_ONLINE_A", physicalQty: 95, allocatedQty: 0, availableQty: 95, minStock: 50, onlineChannel: "ONLINE_A" },
    { id: "stk-10", itemType: "PRODUCT", itemId: "prd-002", itemCode: "PRD-002", itemName: "Produk 2 — Keripik Tempe Pedas Daun Jeruk 250g", unit: "Pcs", locationCode: "STOK_ONLINE_A", physicalQty: 80, allocatedQty: 0, availableQty: 80, minStock: 50, onlineChannel: "ONLINE_A" },
    { id: "stk-11", itemType: "PRODUCT", itemId: "prd-003", itemCode: "PRD-003", itemName: "Produk 3 — Basreng Pedas Ekstra 200g", unit: "Pcs", locationCode: "STOK_ONLINE_B", physicalQty: 110, allocatedQty: 0, availableQty: 110, minStock: 60, onlineChannel: "ONLINE_B" },
    { id: "stk-12", itemType: "PRODUCT", itemId: "prd-004", itemCode: "PRD-004", itemName: "Produk 4 — Sale Pisang Crispy 300g", unit: "Box", locationCode: "STOK_ONLINE_B", physicalQty: 75, allocatedQty: 0, availableQty: 75, minStock: 40, onlineChannel: "ONLINE_B" },
  ];

  const movements: InventoryMovementDTO[] = [
    { id: "mov-001", movementDate: d1, itemType: "MATERIAL", itemId: "mat-001", itemCode: "BHN-001", itemName: "Kedelai Kuning Pilihan", locationCode: "GUDANG_BAHAN_BAKU", direction: "IN", qty: 650, balanceAfter: 650, refType: "MATERIAL_RECEIPT", refNumber: "GR-202611-001", notes: "Penerimaan awal kedelai", actorName: "Hendra Wijaya (Boss)" },
    { id: "mov-002", movementDate: d2, itemType: "PRODUCT", itemId: "prd-001", itemCode: "PRD-001", itemName: "Produk 1 — Keripik Tempe Original 250g", locationCode: "GUDANG_BARANG_JADI_OK", direction: "IN", qty: 320, balanceAfter: 320, refType: "QC_APPROVAL", refNumber: "QC-202611-001", notes: "Lolos QC Batch B-01", actorName: "Hendra Wijaya (Boss)" },
    { id: "mov-003", movementDate: d3, itemType: "PRODUCT", itemId: "prd-001", itemCode: "PRD-001", itemName: "Produk 1 — Keripik Tempe Original 250g", locationCode: "STOK_ONLINE_A", direction: "IN", qty: 95, balanceAfter: 95, refType: "STOCK_TRANSFER", refNumber: "TRF-202611-001", notes: "Alokasi Online A", actorName: "Rizky Pratama (Admin Gudang)" },
  ];

  const materialReceipts: MaterialReceiptDTO[] = [
    { id: "gr-001", receiptNumber: "GR-202611-001", receiptDate: d1, supplierId: "sup-001", supplierName: "UD Sumber Kedelai Priangan", materialId: "mat-001", materialCode: "BHN-001", materialName: "Kedelai Kuning Pilihan", materialType: "BAHAN_BAKU", unit: "Kg", qty: 650, unitPrice: 12500, totalAmount: 8125000, externalDocNumber: "SJ-SKP-881", notes: "Kualitas grade A", status: "POSTED", createdByName: "Hendra Wijaya (Boss)" },
  ];

  const productionOrders: ProductionOrderDTO[] = [
    { id: "prd-ord-001", productionNumber: "PRD-202611-001", productionDate: d2, batchCode: "BATCH-2611-A", productId: "prd-001", productCode: "PRD-001", productName: "Produk 1 — Keripik Tempe Original 250g", unit: "Pcs", targetQty: 350, actualQty: 335, materialsUsed: [{ materialId: "mat-001", materialCode: "BHN-001", materialName: "Kedelai Kuning Pilihan", unit: "Kg", qtyUsed: 120 }], picName: "Rizky Pratama (Admin Gudang)", notes: "Produksi reguler", status: "POSTED", qcCompleted: true },
    { id: "prd-ord-002", productionNumber: "PRD-202611-002", productionDate: d3, batchCode: "BATCH-2611-B", productId: "prd-003", productCode: "PRD-003", productName: "Produk 3 — Basreng Pedas Ekstra 200g", unit: "Pcs", targetQty: 200, actualQty: 200, materialsUsed: [{ materialId: "mat-002", materialCode: "BHN-002", materialName: "Minyak Goreng Sawit", unit: "Liter", qtyUsed: 30 }], picName: "Rizky Pratama (Admin Gudang)", notes: "Menunggu pemeriksaan QC", status: "POSTED", qcCompleted: false },
  ];

  const qcInspections: QcInspectionDTO[] = [
    { id: "qc-001", qcNumber: "QC-202611-001", inspectionDate: d2, productionId: "prd-ord-001", productionNumber: "PRD-202611-001", batchCode: "BATCH-2611-A", productId: "prd-001", productCode: "PRD-001", productName: "Produk 1 — Keripik Tempe Original 250g", inspectedQty: 335, okQty: 320, ngQty: 15, defectCategoryId: "qcd-002", defectCategoryName: "Produk Hancur / Remuk", inspectorName: "Hendra Wijaya (Boss)", notes: "15 pcs remuk saat pengemasan", status: "POSTED" },
  ];

  const stockTransfers: StockTransferDTO[] = [
    { id: "trf-001", transferNumber: "TRF-202611-001", transferDate: d3, fromLocation: "GUDANG_BARANG_JADI_OK", toLocation: "STOK_ONLINE_A", productId: "prd-001", productCode: "PRD-001", productName: "Produk 1 — Keripik Tempe Original 250g", qty: 95, picName: "Rizky Pratama (Admin Gudang)", notes: "Stok promo minggu ini", status: "POSTED" },
  ];

  const sales: SaleDTO[] = [
    { id: "sal-001", invoiceNumber: "INV-OFF-202611-001", saleDate: d2, channel: "OFFLINE", customerId: "cus-001", customerName: "Toko Oleh-Oleh Sari Rasa", orderStatus: "COMPLETED", paymentStatus: "PARTIAL", items: [{ productId: "prd-001", productCode: "PRD-001", productName: "Produk 1 — Keripik Tempe Original 250g", unit: "Pcs", qty: 100, unitPrice: 17500, subtotal: 1750000 }], totalAmount: 1750000, paidAmount: 1000000, remainingAmount: 750000, notes: "Termin 14 hari", status: "POSTED", createdByName: "Rizky Pratama (Admin Gudang)" },
    { id: "sal-002", invoiceNumber: "INV-ONA-202611-001", saleDate: d3, channel: "ONLINE_A", customerName: "Shopee — andi_bandung99", marketplaceOrderRef: "SHP-9928172", orderStatus: "SHIPPED", paymentStatus: "PAID", items: [{ productId: "prd-001", productCode: "PRD-001", productName: "Produk 1 — Keripik Tempe Original 250g", unit: "Pcs", qty: 10, unitPrice: 18000, subtotal: 180000 }], totalAmount: 180000, paidAmount: 180000, remainingAmount: 0, status: "POSTED", createdByName: "Siti Nurhaliza (Admin Online A)" },
    { id: "sal-003", invoiceNumber: "INV-ONB-202611-001", saleDate: d3, channel: "ONLINE_B", customerName: "Tokopedia — rina_jakarta", marketplaceOrderRef: "TKP-7741290", orderStatus: "COMPLETED", paymentStatus: "PAID", items: [{ productId: "prd-003", productCode: "PRD-003", productName: "Produk 3 — Basreng Pedas Ekstra 200g", unit: "Pcs", qty: 15, unitPrice: 16500, subtotal: 247500 }], totalAmount: 247500, paidAmount: 247500, remainingAmount: 0, status: "POSTED", createdByName: "Dedi Kurniawan (Admin Online B)" },
  ];

  const payments: PaymentDTO[] = [
    { id: "pay-001", paymentNumber: "PAY-202611-001", paymentDate: d2, saleId: "sal-001", invoiceNumber: "INV-OFF-202611-001", customerName: "Toko Oleh-Oleh Sari Rasa", channel: "OFFLINE", amount: 1000000, method: "TRANSFER_BANK", notes: "DP 50% lebih", recordedByName: "Rizky Pratama (Admin Gudang)" },
    { id: "pay-002", paymentNumber: "PAY-202611-002", paymentDate: d3, saleId: "sal-002", invoiceNumber: "INV-ONA-202611-001", customerName: "Shopee — andi_bandung99", channel: "ONLINE_A", amount: 180000, method: "MARKETPLACE_SETTLEMENT", recordedByName: "Siti Nurhaliza (Admin Online A)" },
    { id: "pay-003", paymentNumber: "PAY-202611-003", paymentDate: d3, saleId: "sal-003", invoiceNumber: "INV-ONB-202611-001", customerName: "Tokopedia — rina_jakarta", channel: "ONLINE_B", amount: 247500, method: "MARKETPLACE_SETTLEMENT", recordedByName: "Dedi Kurniawan (Admin Online B)" },
  ];

  const monthlySalaries: MonthlySalaryDTO[] = [
    { id: "sal-mon-01", monthKey: "2026-11", totalAmount: 18500000, notes: "Gaji total seluruh karyawan produksi & admin November 2026", updatedAt: d1, recordedByName: "Hendra Wijaya (Boss)" },
  ];

  const auditLogs: AuditLogDTO[] = [
    { id: "aud-001", actorId: "usr-boss-01", actorName: "Hendra Wijaya (Boss)", actorRole: "BOSS", module: "master_products", action: "SEED_INIT", entityId: "prd-001", newValue: "Inisialisasi data master awal", createdAt: d1 },
  ];

  return {
    users,
    products,
    materials,
    suppliers,
    customers,
    qcDefectCategories,
    stockBalances,
    movements,
    materialReceipts,
    productionOrders,
    qcInspections,
    stockTransfers,
    sales,
    payments,
    monthlySalaries,
    auditLogs,
  };
}

export type MockDatabaseState = ReturnType<typeof createInitialSeedData>;
