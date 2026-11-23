# Dokumen Serah Terima Backend (Fase 1 → Fase 2) — Priangan Sentosa ERP

Dokumen ini menjadi acuan tunggal untuk implementasi **Prisma ORM + Supabase PostgreSQL** di Fase 2 tanpa mengubah kode UI maupun Service Layer.

## 1. Daftar Repository Contracts (`src/server/repositories/contracts/`)
1. `UserRepository` (`user.repository.ts`): `findByIdentifier`, `verifyCredentials`, `listUsers`
2. `MasterDataRepository` (`erp.repositories.ts`): `listProducts`, `getProductById`, `createProduct`, `updateProduct`, `listMaterials`, `getMaterialById`, `createMaterial`, `updateMaterial`, `listSuppliers`, `createSupplier`, `updateSupplier`, `listCustomers`, `createCustomer`, `updateCustomer`, `listQcDefectCategories`, `createQcDefectCategory`, `toggleQcDefectCategory`
3. `InventoryRepository` (`erp.repositories.ts`): `listBalances`, `getBalance`, `upsertBalanceDelta`, `appendMovement`, `listMovements`
4. `OperationsRepository` (`erp.repositories.ts`): `listReceipts`, `createReceipt`, `listProductions`, `getProductionById`, `createProduction`, `markProductionQcCompleted`, `listQcInspections`, `createQcInspection`, `listTransfers`, `createTransfer`
5. `SalesAndFinanceRepository` (`erp.repositories.ts`): `listSales`, `getSaleById`, `createSale`, `updateSalePayment`, `updateSaleOrderStatus`, `listPayments`, `createPayment`, `listMonthlySalaries`, `upsertMonthlySalary`
6. `AuditLogRepository` (`erp.repositories.ts`): `appendLog`, `listLogs`

## 2. Daftar Entitas & Field DTO (`src/types/dto.ts`)
- **User**: `id`, `name`, `username` (unique), `email` (unique), `passwordHash`, `role` (`BOSS | ADMIN_GUDANG | ADMIN_ONLINE_A | ADMIN_ONLINE_B`), `isActive`, `createdAt`
- **ProductMaster**: `id`, `code` (unique), `name`, `category`, `unit`, `defaultPrice` (Int Rupiah), `minStock` (Int), `onlineChannel` (`ONLINE_A | ONLINE_B | NONE`), `isActive`, `createdAt`
- **MaterialMaster**: `id`, `code` (unique), `name`, `materialType` (`BAHAN_BAKU | BAHAN_PELENGKAP`), `category`, `unit`, `minStock` (Int), `isActive`, `createdAt`
- **Supplier**: `id`, `name`, `contact`, `address`, `notes`, `isActive`
- **Customer**: `id`, `name`, `contact`, `address`, `creditLimit` (Int Rupiah), `notes`, `isActive`
- **QcDefectCategory**: `id`, `name`, `isActive`
- **StockBalance**: `id`, `itemType`, `itemId`, `itemCode`, `itemName`, `unit`, `locationCode` (6 lokasi tetap), `physicalQty` (Int), `allocatedQty` (Int), `availableQty` (Int), `minStock` (Int), `onlineChannel` (unique composite: `itemType + itemId + locationCode`)
- **InventoryMovement**: `id`, `movementDate`, `itemType`, `itemId`, `itemCode`, `itemName`, `locationCode`, `direction` (`IN | OUT`), `qty` (Int), `balanceAfter` (Int), `refType`, `refNumber`, `notes`, `actorName`
- **MaterialReceipt**: `id`, `receiptNumber` (unique), `receiptDate`, `supplierId`, `materialId`, `qty`, `unitPrice` (Int), `totalAmount` (Int), `externalDocNumber`, `notes`, `status`, `createdByName`
- **ProductionOrder**: `id`, `productionNumber` (unique), `productionDate`, `batchCode`, `productId`, `targetQty`, `actualQty`, `materialsUsed` (JSON / relasi), `picName`, `notes`, `status`, `qcCompleted`
- **QcInspection**: `id`, `qcNumber` (unique), `inspectionDate`, `productionId`, `batchCode`, `productId`, `inspectedQty`, `okQty`, `ngQty`, `defectCategoryId`, `inspectorName`, `notes`, `status`
- **StockTransfer**: `id`, `transferNumber` (unique), `transferDate`, `fromLocation`, `toLocation`, `productId`, `qty`, `picName`, `notes`, `status`
- **Sale & SaleItem**: `id`, `invoiceNumber` (unique), `saleDate`, `channel` (`OFFLINE | ONLINE_A | ONLINE_B`), `customerId`, `customerName`, `marketplaceOrderRef`, `orderStatus`, `paymentStatus`, `totalAmount` (Int), `paidAmount` (Int), `remainingAmount` (Int), `status`, `createdByName`
- **Payment**: `id`, `paymentNumber` (unique), `paymentDate`, `saleId`, `invoiceNumber`, `customerName`, `channel`, `amount` (Int), `method`, `notes`, `recordedByName`
- **MonthlySalary**: `id`, `monthKey` (unique `YYYY-MM`), `totalAmount` (Int), `notes`, `updatedAt`, `recordedByName`
- **AuditLog**: `id`, `actorId`, `actorName`, `actorRole`, `module`, `action`, `entityId`, `oldValue`, `newValue`, `createdAt`

## 3. Aturan Bisnis di Service Layer (`src/server/services/erp.service.ts`)
- Setiap mutasi stok wajib melalui `uow.runInTransaction()` dan menghasilkan baris `InventoryMovement`.
- Stok negatif dilarang (`INSUFFICIENT_STOCK`).
- Pengesahan QC wajib memenuhi `okQty + ngQty === inspectedQty`; barang NG masuk ke `GUDANG_BARANG_NG` dan terpisah dari `GUDANG_BARANG_JADI_OK`.
- Admin Online A hanya boleh mengakses produk dengan `onlineChannel === "ONLINE_A"` dan Admin Online B hanya `"ONLINE_B"`, serta wajib memakai `defaultPrice` dari master.
- Laporan Profit bersifat Non-HPP: `Net Profit = Total Penjualan - Total Pembayaran Bahan Mentah - Total Gaji Bulanan`.

## 4. Titik `// BACKEND-SLOT:` untuk Fase 2
1. `.env.example` → tambahkan `DATABASE_URL` (pooled) dan `DIRECT_URL` (direct migration).
2. `src/server/uow.ts` → teruskan `prismaTx: Prisma.TransactionClient` di dalam `TransactionContext`.
3. `src/server/container.ts` → aktifkan cabang `DATA_SOURCE === "prisma"` dengan `PrismaUnitOfWork` dan implementasi di `src/server/repositories/prisma/`.
4. `src/lib/auth.ts` → otomatis memakai `PrismaUserRepository` saat `DATA_SOURCE=prisma`.

## 5. Data Seed Awal (`prisma/seed.ts`)
Pindahkan data awal dari `src/mocks/seed.ts`: 4 akun pengguna (`boss`, `gudang`, `onlinea`, `onlineb`), 4 produk jadi (`PRD-001` s/d `PRD-004`), 3 bahan (`BHN-001`, `BHN-002`, `PLG-001`), 2 supplier, 2 pelanggan, dan 3 kategori cacat QC.
