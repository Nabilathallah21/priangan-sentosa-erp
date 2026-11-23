import bcrypt from "bcryptjs";
import "server-only";
import { UnitOfWork } from "@/server/uow";
import {
  MasterDataRepository, InventoryRepository, OperationsRepository,
  SalesAndFinanceRepository, AuditLogRepository
} from "@/server/repositories/contracts/erp.repositories";
import { UserRepository } from "@/server/repositories/contracts/user.repository";
import {
  UserRole, StockLocationCode, SalesChannel, DashboardSummaryDTO, ProfitReportRowDTO
} from "@/types/dto";
import { AppError } from "@/lib/errors";

export interface ActorContext {
  userId: string;
  userName: string;
  role: UserRole;
}

export class ErpService {
  constructor(
    private readonly uow: UnitOfWork,
    private readonly masterRepo: MasterDataRepository,
    private readonly invRepo: InventoryRepository,
    private readonly opsRepo: OperationsRepository,
    private readonly salesRepo: SalesAndFinanceRepository,
    private readonly userRepo: UserRepository,
    private readonly auditRepo: AuditLogRepository
  ) {}

  private docNo(prefix: string): string {
    const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rnd = Math.floor(Math.random() * 900 + 100);
    return `${prefix}-${d}-${rnd}`;
  }

  // --- MANAJEMEN PENGGUNA ---
  async createUser(actor: ActorContext, input: {
    name: string; username: string; email: string; password: string; role: UserRole;
  }) {
    const existing = await this.userRepo.findByIdentifier(input.username);
    if (existing) throw new AppError("DUPLICATE_CODE", "Username sudah digunakan.");
    const existingEmail = await this.userRepo.findByIdentifier(input.email);
    if (existingEmail) throw new AppError("DUPLICATE_CODE", "Email sudah digunakan.");

    const passwordHash = await bcrypt.hash(input.password, 10);
    const created = await this.userRepo.createUser({
      name: input.name,
      username: input.username,
      email: input.email,
      passwordHash,
      role: input.role,
    });
    await this.auditRepo.appendLog({
      actorId: actor.userId, actorName: actor.userName, actorRole: actor.role,
      module: "master_users", action: "CREATE_USER", entityId: created.id,
      newValue: created.username + " (" + created.role + ")",
      createdAt: new Date().toISOString(),
    });
    return created;
  }

  async toggleUserStatus(actor: ActorContext, id: string, isActive: boolean) {
    if (actor.userId === id && !isActive) {
      throw new AppError("INVALID_STATE", "Anda tidak dapat menonaktifkan akun Anda sendiri.");
    }
    const updated = await this.userRepo.updateUserStatus(id, isActive);
    await this.auditRepo.appendLog({
      actorId: actor.userId, actorName: actor.userName, actorRole: actor.role,
      module: "master_users", action: isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER",
      entityId: id, newValue: "isActive=" + isActive, createdAt: new Date().toISOString(),
    });
    return updated;
  }

  // --- MASTER DATA ---
  async createProduct(actor: ActorContext, input: {
    code: string; name: string; category: string; unit: string;
    defaultPrice: number; minStock: number; onlineChannel: "ONLINE_A" | "ONLINE_B" | "NONE";
  }) {
    const existing = await this.masterRepo.listProducts({ page: 1, pageSize: 500, search: input.code });
    if (existing.items.some((p) => p.code.toLowerCase() === input.code.trim().toLowerCase())) {
      throw new AppError("DUPLICATE_CODE", `Kode produk '${input.code}' sudah terdaftar.`);
    }
    const created = await this.masterRepo.createProduct({ ...input, isActive: true });
    await this.auditRepo.appendLog({
      actorId: actor.userId, actorName: actor.userName, actorRole: actor.role,
      module: "master_products", action: "CREATE_PRODUCT", entityId: created.id,
      newValue: `${created.code} - ${created.name} (Rp ${created.defaultPrice})`,
      createdAt: new Date().toISOString(),
    });
    return created;
  }

  async toggleProductStatus(actor: ActorContext, id: string, isActive: boolean) {
    const updated = await this.masterRepo.updateProduct(id, { isActive });
    await this.auditRepo.appendLog({
      actorId: actor.userId, actorName: actor.userName, actorRole: actor.role,
      module: "master_products", action: isActive ? "ACTIVATE_PRODUCT" : "DEACTIVATE_PRODUCT",
      entityId: id, newValue: `isActive=${isActive}`, createdAt: new Date().toISOString(),
    });
    return updated;
  }

  async createMaterial(actor: ActorContext, input: {
    code: string; name: string; materialType: "BAHAN_BAKU" | "BAHAN_PELENGKAP";
    category: string; unit: string; minStock: number;
  }) {
    const existing = await this.masterRepo.listMaterials({ page: 1, pageSize: 500, search: input.code });
    if (existing.items.some((m) => m.code.toLowerCase() === input.code.trim().toLowerCase())) {
      throw new AppError("DUPLICATE_CODE", `Kode bahan '${input.code}' sudah terdaftar.`);
    }
    const created = await this.masterRepo.createMaterial({ ...input, isActive: true });
    await this.auditRepo.appendLog({
      actorId: actor.userId, actorName: actor.userName, actorRole: actor.role,
      module: "master_materials", action: "CREATE_MATERIAL", entityId: created.id,
      newValue: `${created.code} - ${created.name}`, createdAt: new Date().toISOString(),
    });
    return created;
  }

  async toggleMaterialStatus(actor: ActorContext, id: string, isActive: boolean) {
    return this.masterRepo.updateMaterial(id, { isActive });
  }

  async createSupplier(actor: ActorContext, input: { name: string; contact: string; address: string; notes?: string }) {
    const created = await this.masterRepo.createSupplier({ ...input, isActive: true });
    await this.auditRepo.appendLog({
      actorId: actor.userId, actorName: actor.userName, actorRole: actor.role,
      module: "master_suppliers", action: "CREATE_SUPPLIER", entityId: created.id,
      newValue: created.name, createdAt: new Date().toISOString(),
    });
    return created;
  }

  async createCustomer(actor: ActorContext, input: { name: string; contact: string; address: string; creditLimit?: number; notes?: string }) {
    const created = await this.masterRepo.createCustomer({ ...input, isActive: true });
    await this.auditRepo.appendLog({
      actorId: actor.userId, actorName: actor.userName, actorRole: actor.role,
      module: "master_customers", action: "CREATE_CUSTOMER", entityId: created.id,
      newValue: created.name, createdAt: new Date().toISOString(),
    });
    return created;
  }

  async createQcDefectCategory(actor: ActorContext, name: string) {
    const created = await this.masterRepo.createQcDefectCategory(name);
    await this.auditRepo.appendLog({
      actorId: actor.userId, actorName: actor.userName, actorRole: actor.role,
      module: "master_qc_defects", action: "CREATE_QC_DEFECT", entityId: created.id,
      newValue: name, createdAt: new Date().toISOString(),
    });
    return created;
  }

  // --- SALDO AWAL STOK ---
  async postOpeningBalance(actor: ActorContext, input: {
    itemType: "MATERIAL" | "PRODUCT";
    itemId: string;
    locationCode: StockLocationCode;
    qty: number;
    notes?: string;
  }) {
    return this.uow.runInTransaction(async (tx) => {
      const refNumber = this.docNo("OPB");
      if (input.itemType === "MATERIAL") {
        const mat = await this.masterRepo.getMaterialById(input.itemId);
        if (!mat) throw new AppError("NOT_FOUND", "Bahan tidak ditemukan di master.");
        const bal = await this.invRepo.upsertBalanceDelta({
          itemType: "MATERIAL", itemId: mat.id, itemCode: mat.code, itemName: mat.name,
          unit: mat.unit, locationCode: input.locationCode, deltaPhysical: input.qty, minStock: mat.minStock,
        }, tx);
        await this.invRepo.appendMovement({
          movementDate: new Date().toISOString(), itemType: "MATERIAL", itemId: mat.id,
          itemCode: mat.code, itemName: mat.name, locationCode: input.locationCode,
          direction: "IN", qty: input.qty, balanceAfter: bal.physicalQty,
          refType: "OPENING_BALANCE", refNumber, notes: input.notes ?? "Saldo awal stok", actorName: actor.userName,
        }, tx);
        return bal;
      } else {
        const prd = await this.masterRepo.getProductById(input.itemId);
        if (!prd) throw new AppError("NOT_FOUND", "Produk tidak ditemukan di master.");
        const bal = await this.invRepo.upsertBalanceDelta({
          itemType: "PRODUCT", itemId: prd.id, itemCode: prd.code, itemName: prd.name,
          unit: prd.unit, locationCode: input.locationCode, deltaPhysical: input.qty,
          minStock: prd.minStock, onlineChannel: prd.onlineChannel,
        }, tx);
        await this.invRepo.appendMovement({
          movementDate: new Date().toISOString(), itemType: "PRODUCT", itemId: prd.id,
          itemCode: prd.code, itemName: prd.name, locationCode: input.locationCode,
          direction: "IN", qty: input.qty, balanceAfter: bal.physicalQty,
          refType: "OPENING_BALANCE", refNumber, notes: input.notes ?? "Saldo awal stok", actorName: actor.userName,
        }, tx);
        return bal;
      }
    });
  }

  // --- PENERIMAAN BAHAN ---
  async postMaterialReceipt(actor: ActorContext, input: {
    receiptDate: string; supplierId: string; materialId: string;
    qty: number; unitPrice: number; externalDocNumber: string; notes?: string;
  }) {
    return this.uow.runInTransaction(async (tx) => {
      const suppliers = await this.masterRepo.listSuppliers({ page: 1, pageSize: 500 });
      const supplier = suppliers.items.find((s) => s.id === input.supplierId);
      if (!supplier) throw new AppError("NOT_FOUND", "Supplier tidak ditemukan.");

      const material = await this.masterRepo.getMaterialById(input.materialId);
      if (!material || !material.isActive) throw new AppError("NOT_FOUND", "Bahan tidak aktif atau tidak ditemukan.");

      const locationCode: StockLocationCode =
        material.materialType === "BAHAN_BAKU" ? "GUDANG_BAHAN_BAKU" : "GUDANG_BAHAN_PELENGKAP";

      const receiptNumber = this.docNo("GR");
      const receipt = await this.opsRepo.createReceipt({
        receiptNumber,
        receiptDate: new Date(input.receiptDate).toISOString(),
        supplierId: supplier.id,
        supplierName: supplier.name,
        materialId: material.id,
        materialCode: material.code,
        materialName: material.name,
        materialType: material.materialType,
        unit: material.unit,
        qty: input.qty,
        unitPrice: input.unitPrice,
        totalAmount: input.qty * input.unitPrice,
        externalDocNumber: input.externalDocNumber,
        notes: input.notes,
        status: "POSTED",
        createdByName: actor.userName,
      }, tx);

      const bal = await this.invRepo.upsertBalanceDelta({
        itemType: "MATERIAL", itemId: material.id, itemCode: material.code, itemName: material.name,
        unit: material.unit, locationCode, deltaPhysical: input.qty, minStock: material.minStock,
      }, tx);

      await this.invRepo.appendMovement({
        movementDate: receipt.receiptDate, itemType: "MATERIAL", itemId: material.id,
        itemCode: material.code, itemName: material.name, locationCode,
        direction: "IN", qty: input.qty, balanceAfter: bal.physicalQty,
        refType: "MATERIAL_RECEIPT", refNumber: receiptNumber, notes: `SJ: ${input.externalDocNumber}`, actorName: actor.userName,
      }, tx);

      return receipt;
    });
  }

  // --- PENGELUARAN BAHAN & PRODUKSI ---
  async postProduction(actor: ActorContext, input: {
    productionDate: string; batchCode: string; productId: string;
    targetQty: number; actualQty: number; materialId: string; materialQtyUsed: number; notes?: string;
  }) {
    return this.uow.runInTransaction(async (tx) => {
      const product = await this.masterRepo.getProductById(input.productId);
      if (!product || !product.isActive) throw new AppError("NOT_FOUND", "Produk tidak aktif.");

      const material = await this.masterRepo.getMaterialById(input.materialId);
      if (!material) throw new AppError("NOT_FOUND", "Bahan tidak ditemukan.");

      const matLoc: StockLocationCode =
        material.materialType === "BAHAN_BAKU" ? "GUDANG_BAHAN_BAKU" : "GUDANG_BAHAN_PELENGKAP";

      const currentBal = await this.invRepo.getBalance("MATERIAL", material.id, matLoc);
      const available = currentBal?.availableQty ?? 0;
      if (available < input.materialQtyUsed) {
        throw new AppError(
          "INSUFFICIENT_STOCK",
          `Stok ${material.name} tidak mencukupi (Tersedia: ${available} ${material.unit}, Dibutuhkan: ${input.materialQtyUsed} ${material.unit}).`
        );
      }

      const productionNumber = this.docNo("PRD");
      const updatedBal = await this.invRepo.upsertBalanceDelta({
        itemType: "MATERIAL", itemId: material.id, itemCode: material.code, itemName: material.name,
        unit: material.unit, locationCode: matLoc, deltaPhysical: -input.materialQtyUsed, minStock: material.minStock,
      }, tx);

      await this.invRepo.appendMovement({
        movementDate: new Date(input.productionDate).toISOString(), itemType: "MATERIAL",
        itemId: material.id, itemCode: material.code, itemName: material.name, locationCode: matLoc,
        direction: "OUT", qty: input.materialQtyUsed, balanceAfter: updatedBal.physicalQty,
        refType: "MATERIAL_ISSUE", refNumber: productionNumber, notes: `Batch ${input.batchCode}`, actorName: actor.userName,
      }, tx);

      return this.opsRepo.createProduction({
        productionNumber,
        productionDate: new Date(input.productionDate).toISOString(),
        batchCode: input.batchCode,
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        unit: product.unit,
        targetQty: input.targetQty,
        actualQty: input.actualQty,
        materialsUsed: [{
          materialId: material.id,
          materialCode: material.code,
          materialName: material.name,
          unit: material.unit,
          qtyUsed: input.materialQtyUsed,
        }],
        picName: actor.userName,
        notes: input.notes,
        status: "POSTED",
        qcCompleted: false,
      }, tx);
    });
  }

  // --- QUALITY CONTROL (WAJIB: diperiksa = OK + NG) ---
  async approveQcInspection(actor: ActorContext, input: {
    inspectionDate: string; productionId: string; inspectedQty: number;
    okQty: number; ngQty: number; defectCategoryId?: string; notes?: string;
  }) {
    if (input.okQty + input.ngQty !== input.inspectedQty) {
      throw new AppError(
        "VALIDATION_ERROR",
        `Jumlah diperiksa (${input.inspectedQty}) harus sama dengan OK (${input.okQty}) + NG (${input.ngQty}).`
      );
    }

    return this.uow.runInTransaction(async (tx) => {
      const prod = await this.opsRepo.getProductionById(input.productionId);
      if (!prod) throw new AppError("NOT_FOUND", "Dokumen produksi tidak ditemukan.");
      if (prod.qcCompleted) throw new AppError("INVALID_STATE", "Batch produksi ini sudah disahkan QC.");

      const product = await this.masterRepo.getProductById(prod.productId);
      if (!product) throw new AppError("NOT_FOUND", "Produk tidak ditemukan.");

      let defectCategoryName: string | undefined;
      if (input.ngQty > 0 && input.defectCategoryId) {
        const cats = await this.masterRepo.listQcDefectCategories();
        defectCategoryName = cats.find((c) => c.id === input.defectCategoryId)?.name;
      }

      const qcNumber = this.docNo("QC");
      const qcDoc = await this.opsRepo.createQcInspection({
        qcNumber,
        inspectionDate: new Date(input.inspectionDate).toISOString(),
        productionId: prod.id,
        productionNumber: prod.productionNumber,
        batchCode: prod.batchCode,
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        inspectedQty: input.inspectedQty,
        okQty: input.okQty,
        ngQty: input.ngQty,
        defectCategoryId: input.defectCategoryId,
        defectCategoryName,
        inspectorName: actor.userName,
        notes: input.notes,
        status: "POSTED",
      }, tx);

      if (input.okQty > 0) {
        const okBal = await this.invRepo.upsertBalanceDelta({
          itemType: "PRODUCT", itemId: product.id, itemCode: product.code, itemName: product.name,
          unit: product.unit, locationCode: "GUDANG_BARANG_JADI_OK", deltaPhysical: input.okQty,
          minStock: product.minStock, onlineChannel: product.onlineChannel,
        }, tx);
        await this.invRepo.appendMovement({
          movementDate: qcDoc.inspectionDate, itemType: "PRODUCT", itemId: product.id,
          itemCode: product.code, itemName: product.name, locationCode: "GUDANG_BARANG_JADI_OK",
          direction: "IN", qty: input.okQty, balanceAfter: okBal.physicalQty,
          refType: "QC_APPROVAL", refNumber: qcNumber, notes: `QC OK Batch ${prod.batchCode}`, actorName: actor.userName,
        }, tx);
      }

      if (input.ngQty > 0) {
        const ngBal = await this.invRepo.upsertBalanceDelta({
          itemType: "PRODUCT", itemId: product.id, itemCode: product.code, itemName: product.name,
          unit: product.unit, locationCode: "GUDANG_BARANG_NG", deltaPhysical: input.ngQty,
          minStock: 0, onlineChannel: product.onlineChannel,
        }, tx);
        await this.invRepo.appendMovement({
          movementDate: qcDoc.inspectionDate, itemType: "PRODUCT", itemId: product.id,
          itemCode: product.code, itemName: product.name, locationCode: "GUDANG_BARANG_NG",
          direction: "IN", qty: input.ngQty, balanceAfter: ngBal.physicalQty,
          refType: "QC_APPROVAL", refNumber: qcNumber, notes: `QC NG (${defectCategoryName ?? "Cacat"})`, actorName: actor.userName,
        }, tx);
      }

      await this.opsRepo.markProductionQcCompleted(prod.id, tx);
      return qcDoc;
    });
  }

  // --- TRANSFER STOK ONLINE (ATOMIK, VALIDASI KANAL PRODUK) ---
  async postStockTransfer(actor: ActorContext, input: {
    transferDate: string; toLocation: "STOK_ONLINE_A" | "STOK_ONLINE_B";
    productId: string; qty: number; notes?: string;
  }) {
    return this.uow.runInTransaction(async (tx) => {
      const product = await this.masterRepo.getProductById(input.productId);
      if (!product || !product.isActive) throw new AppError("NOT_FOUND", "Produk tidak ditemukan.");

      const expectedChannel = input.toLocation === "STOK_ONLINE_A" ? "ONLINE_A" : "ONLINE_B";
      if (product.onlineChannel !== expectedChannel) {
        throw new AppError(
          "VALIDATION_ERROR",
          `Produk ${product.code} terdaftar untuk kanal '${product.onlineChannel}', tidak dapat ditransfer ke ${input.toLocation}.`
        );
      }

      const sourceBal = await this.invRepo.getBalance("PRODUCT", product.id, "GUDANG_BARANG_JADI_OK");
      const available = sourceBal?.availableQty ?? 0;
      if (available < input.qty) {
        throw new AppError(
          "INSUFFICIENT_STOCK",
          `Stok Gudang Barang Jadi OK tidak cukup (Tersedia: ${available} ${product.unit}).`
        );
      }

      const transferNumber = this.docNo("TRF");
      const afterOut = await this.invRepo.upsertBalanceDelta({
        itemType: "PRODUCT", itemId: product.id, itemCode: product.code, itemName: product.name,
        unit: product.unit, locationCode: "GUDANG_BARANG_JADI_OK", deltaPhysical: -input.qty,
        minStock: product.minStock, onlineChannel: product.onlineChannel,
      }, tx);

      await this.invRepo.appendMovement({
        movementDate: new Date(input.transferDate).toISOString(), itemType: "PRODUCT",
        itemId: product.id, itemCode: product.code, itemName: product.name,
        locationCode: "GUDANG_BARANG_JADI_OK", direction: "OUT", qty: input.qty,
        balanceAfter: afterOut.physicalQty, refType: "STOCK_TRANSFER", refNumber: transferNumber,
        notes: `Transfer ke ${input.toLocation}`, actorName: actor.userName,
      }, tx);

      const afterIn = await this.invRepo.upsertBalanceDelta({
        itemType: "PRODUCT", itemId: product.id, itemCode: product.code, itemName: product.name,
        unit: product.unit, locationCode: input.toLocation, deltaPhysical: input.qty,
        minStock: Math.floor(product.minStock / 2), onlineChannel: product.onlineChannel,
      }, tx);

      await this.invRepo.appendMovement({
        movementDate: new Date(input.transferDate).toISOString(), itemType: "PRODUCT",
        itemId: product.id, itemCode: product.code, itemName: product.name,
        locationCode: input.toLocation, direction: "IN", qty: input.qty,
        balanceAfter: afterIn.physicalQty, refType: "STOCK_TRANSFER", refNumber: transferNumber,
        notes: "Terima alokasi dari Gudang OK", actorName: actor.userName,
      }, tx);

      return this.opsRepo.createTransfer({
        transferNumber,
        transferDate: new Date(input.transferDate).toISOString(),
        fromLocation: "GUDANG_BARANG_JADI_OK",
        toLocation: input.toLocation,
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        qty: input.qty,
        picName: actor.userName,
        notes: input.notes,
        status: "POSTED",
      }, tx);
    });
  }

  // --- PENJUALAN OFFLINE & ONLINE (ISOLASI KANAL & STOK) ---
  async postSale(actor: ActorContext, input: {
    saleDate: string; channel: SalesChannel; customerId?: string; customerName: string;
    marketplaceOrderRef?: string; productId: string; qty: number; unitPrice: number;
    initialPayment: number; paymentMethod: "TUNAI" | "TRANSFER_BANK" | "QRIS" | "MARKETPLACE_SETTLEMENT";
    notes?: string;
  }) {
    // Penegakan isolasi kanal di server
    if (actor.role === "ADMIN_ONLINE_A" && input.channel !== "ONLINE_A") {
      throw new AppError("FORBIDDEN", "Admin Online A hanya dapat mencatat transaksi kanal ONLINE_A.");
    }
    if (actor.role === "ADMIN_ONLINE_B" && input.channel !== "ONLINE_B") {
      throw new AppError("FORBIDDEN", "Admin Online B hanya dapat mencatat transaksi kanal ONLINE_B.");
    }

    return this.uow.runInTransaction(async (tx) => {
      const product = await this.masterRepo.getProductById(input.productId);
      if (!product || !product.isActive) throw new AppError("NOT_FOUND", "Produk tidak aktif.");

      if (input.channel === "ONLINE_A" && product.onlineChannel !== "ONLINE_A") {
        throw new AppError("FORBIDDEN", "Produk ini bukan milik kanal Online A.");
      }
      if (input.channel === "ONLINE_B" && product.onlineChannel !== "ONLINE_B") {
        throw new AppError("FORBIDDEN", "Produk ini bukan milik kanal Online B.");
      }

      // Admin Online wajib memakai harga default master
      const effectivePrice =
        actor.role === "ADMIN_ONLINE_A" || actor.role === "ADMIN_ONLINE_B"
          ? product.defaultPrice
          : input.unitPrice;

      if (effectivePrice !== product.defaultPrice) {
        await this.auditRepo.appendLog({
          actorId: actor.userId, actorName: actor.userName, actorRole: actor.role,
          module: "sales", action: "PRICE_OVERRIDE", entityId: product.id,
          oldValue: `Rp ${product.defaultPrice}`, newValue: `Rp ${effectivePrice}`,
          createdAt: new Date().toISOString(),
        }, tx);
      }

      const stockLoc: StockLocationCode =
        input.channel === "OFFLINE"
          ? "GUDANG_BARANG_JADI_OK"
          : input.channel === "ONLINE_A"
          ? "STOK_ONLINE_A"
          : "STOK_ONLINE_B";

      const bal = await this.invRepo.getBalance("PRODUCT", product.id, stockLoc);
      const available = bal?.availableQty ?? 0;
      if (available < input.qty) {
        throw new AppError(
          "INSUFFICIENT_STOCK",
          `Stok ${product.name} di ${stockLoc} tidak cukup (Tersedia: ${available} ${product.unit}).`
        );
      }

      const totalAmount = input.qty * effectivePrice;
      const paidAmount = Math.min(totalAmount, Math.max(0, input.initialPayment));
      const remainingAmount = totalAmount - paidAmount;
      const paymentStatus = remainingAmount === 0 ? "PAID" : paidAmount > 0 ? "PARTIAL" : "UNPAID";

      const prefix = input.channel === "OFFLINE" ? "INV-OFF" : input.channel === "ONLINE_A" ? "INV-ONA" : "INV-ONB";
      const invoiceNumber = this.docNo(prefix);

      const sale = await this.salesRepo.createSale({
        invoiceNumber,
        saleDate: new Date(input.saleDate).toISOString(),
        channel: input.channel,
        customerId: input.customerId,
        customerName: input.customerName,
        marketplaceOrderRef: input.marketplaceOrderRef,
        orderStatus: input.channel === "OFFLINE" ? "COMPLETED" : "PACKED",
        paymentStatus,
        items: [{
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          unit: product.unit,
          qty: input.qty,
          unitPrice: effectivePrice,
          subtotal: totalAmount,
        }],
        totalAmount,
        paidAmount,
        remainingAmount,
        notes: input.notes,
        status: "POSTED",
        createdByName: actor.userName,
      }, tx);

      const afterOut = await this.invRepo.upsertBalanceDelta({
        itemType: "PRODUCT", itemId: product.id, itemCode: product.code, itemName: product.name,
        unit: product.unit, locationCode: stockLoc, deltaPhysical: -input.qty,
        minStock: product.minStock, onlineChannel: product.onlineChannel,
      }, tx);

      await this.invRepo.appendMovement({
        movementDate: sale.saleDate, itemType: "PRODUCT", itemId: product.id,
        itemCode: product.code, itemName: product.name, locationCode: stockLoc,
        direction: "OUT", qty: input.qty, balanceAfter: afterOut.physicalQty,
        refType: "SALE", refNumber: invoiceNumber, notes: `Penjualan ${input.channel} - ${input.customerName}`,
        actorName: actor.userName,
      }, tx);

      if (paidAmount > 0) {
        await this.salesRepo.createPayment({
          paymentNumber: this.docNo("PAY"),
          paymentDate: sale.saleDate,
          saleId: sale.id,
          invoiceNumber,
          customerName: input.customerName,
          channel: input.channel,
          amount: paidAmount,
          method: input.paymentMethod,
          notes: "Pembayaran saat transaksi",
          recordedByName: actor.userName,
        }, tx);
      }

      return sale;
    });
  }

  // --- PEMBAYARAN PIUTANG ---
  async recordPayment(actor: ActorContext, input: {
    saleId: string; paymentDate: string; amount: number;
    method: "TUNAI" | "TRANSFER_BANK" | "QRIS" | "MARKETPLACE_SETTLEMENT"; notes?: string;
  }) {
    return this.uow.runInTransaction(async (tx) => {
      const sale = await this.salesRepo.getSaleById(input.saleId);
      if (!sale) throw new AppError("NOT_FOUND", "Faktur penjualan tidak ditemukan.");
      if (sale.remainingAmount <= 0) throw new AppError("INVALID_STATE", "Faktur ini sudah lunas.");
      if (input.amount > sale.remainingAmount) {
        throw new AppError("VALIDATION_ERROR", `Nominal pembayaran melebihi sisa piutang (Rp ${sale.remainingAmount}).`);
      }

      const nextPaid = sale.paidAmount + input.amount;
      const nextRemaining = sale.totalAmount - nextPaid;
      const nextStatus = nextRemaining === 0 ? "PAID" : "PARTIAL";

      await this.salesRepo.updateSalePayment(sale.id, nextPaid, nextRemaining, nextStatus, tx);

      return this.salesRepo.createPayment({
        paymentNumber: this.docNo("PAY"),
        paymentDate: new Date(input.paymentDate).toISOString(),
        saleId: sale.id,
        invoiceNumber: sale.invoiceNumber,
        customerName: sale.customerName,
        channel: sale.channel,
        amount: input.amount,
        method: input.method,
        notes: input.notes,
        recordedByName: actor.userName,
      }, tx);
    });
  }

  async updateOnlineOrderStatus(actor: ActorContext, saleId: string, orderStatus: "PENDING" | "PACKED" | "SHIPPED" | "COMPLETED" | "CANCELLED") {
    return this.uow.runInTransaction(async (tx) => {
      const sale = await this.salesRepo.getSaleById(saleId);
      if (!sale) throw new AppError("NOT_FOUND", "Pesanan tidak ditemukan.");
      if (actor.role === "ADMIN_ONLINE_A" && sale.channel !== "ONLINE_A") {
        throw new AppError("FORBIDDEN", "Akses ditolak untuk pesanan kanal lain.");
      }
      if (actor.role === "ADMIN_ONLINE_B" && sale.channel !== "ONLINE_B") {
        throw new AppError("FORBIDDEN", "Akses ditolak untuk pesanan kanal lain.");
      }
      return this.salesRepo.updateSaleOrderStatus(saleId, orderStatus, tx);
    });
  }

  // --- PENGELUARAN GAJI BULANAN (NON-HPP) ---
  async saveMonthlySalary(actor: ActorContext, input: { monthKey: string; totalAmount: number; notes?: string }) {
    return this.uow.runInTransaction(async (tx) => {
      const saved = await this.salesRepo.upsertMonthlySalary({
        monthKey: input.monthKey,
        totalAmount: input.totalAmount,
        notes: input.notes,
        updatedAt: new Date().toISOString(),
        recordedByName: actor.userName,
      }, tx);
      await this.auditRepo.appendLog({
        actorId: actor.userId, actorName: actor.userName, actorRole: actor.role,
        module: "expenses", action: "UPSERT_SALARY", entityId: saved.id,
        newValue: `Bulan ${input.monthKey}: Rp ${input.totalAmount}`,
        createdAt: new Date().toISOString(),
      }, tx);
      return saved;
    });
  }

  // --- DASHBOARD & LAPORAN PROFIT (NON-HPP: Penjualan - Bahan Mentah - Gaji Bulanan) ---
  async getDashboardSummary(): Promise<DashboardSummaryDTO> {
    const [balances, salesRes] = await Promise.all([
      this.invRepo.listBalances({ page: 1, pageSize: 500 }),
      this.salesRepo.listSales({ page: 1, pageSize: 500 }),
    ]);

    const sumLoc = (loc: StockLocationCode) =>
      balances.items.filter((b) => b.locationCode === loc).reduce((acc, b) => acc + b.physicalQty, 0);

    const lowStockCount = balances.items.filter(
      (b) => b.locationCode !== "GUDANG_BARANG_NG" && b.availableQty <= b.minStock
    ).length;

    const offlineSalesTotal = salesRes.items.filter((s) => s.channel === "OFFLINE").reduce((a, s) => a + s.totalAmount, 0);
    const onlineASalesTotal = salesRes.items.filter((s) => s.channel === "ONLINE_A").reduce((a, s) => a + s.totalAmount, 0);
    const onlineBSalesTotal = salesRes.items.filter((s) => s.channel === "ONLINE_B").reduce((a, s) => a + s.totalAmount, 0);
    const totalReceivables = salesRes.items.reduce((a, s) => a + s.remainingAmount, 0);

    return {
      totalRawMaterialStock: sumLoc("GUDANG_BAHAN_BAKU"),
      totalAuxMaterialStock: sumLoc("GUDANG_BAHAN_PELENGKAP"),
      totalFinishedOkStock: sumLoc("GUDANG_BARANG_JADI_OK"),
      totalFinishedNgStock: sumLoc("GUDANG_BARANG_NG"),
      totalOnlineAStock: sumLoc("STOK_ONLINE_A"),
      totalOnlineBStock: sumLoc("STOK_ONLINE_B"),
      lowStockCount,
      offlineSalesTotal,
      onlineASalesTotal,
      onlineBSalesTotal,
      totalReceivables,
      chartSeries: [
        { label: "Minggu 1", masuk: 420, keluar: 280, penjualan: 3200000 },
        { label: "Minggu 2", masuk: 510, keluar: 340, penjualan: 4150000 },
        { label: "Minggu 3", masuk: 650, keluar: 410, penjualan: 5400000 },
        { label: "Minggu 4", masuk: 480, keluar: 310, penjualan: offlineSalesTotal + onlineASalesTotal + onlineBSalesTotal },
      ],
    };
  }

  async getProfitReport(period: "DAILY" | "WEEKLY" | "MONTHLY"): Promise<ProfitReportRowDTO[]> {
    const [salesRes, receiptsRes, salaries] = await Promise.all([
      this.salesRepo.listSales({ page: 1, pageSize: 1000 }),
      this.opsRepo.listReceipts({ page: 1, pageSize: 1000 }),
      this.salesRepo.listMonthlySalaries(),
    ]);

    const grouped = new Map<string, ProfitReportRowDTO>();

    const getKey = (isoDate: string) => {
      if (period === "DAILY") return isoDate.slice(0, 10);
      if (period === "MONTHLY") return isoDate.slice(0, 7);
      const d = new Date(isoDate);
      const week = Math.ceil(d.getUTCDate() / 7);
      return `${isoDate.slice(0, 7)} (Minggu ${week})`;
    };

    for (const s of salesRes.items) {
      const k = getKey(s.saleDate);
      const row = grouped.get(k) ?? { periodLabel: k, totalSales: 0, rawMaterialPayments: 0, salaryExpense: 0, netProfit: 0 };
      row.totalSales += s.totalAmount;
      grouped.set(k, row);
    }

    for (const r of receiptsRes.items) {
      const k = getKey(r.receiptDate);
      const row = grouped.get(k) ?? { periodLabel: k, totalSales: 0, rawMaterialPayments: 0, salaryExpense: 0, netProfit: 0 };
      row.rawMaterialPayments += r.totalAmount;
      grouped.set(k, row);
    }

    for (const sal of salaries) {
      const k = period === "MONTHLY" ? sal.monthKey : `${sal.monthKey}-01`;
      const row = grouped.get(k) ?? { periodLabel: k, totalSales: 0, rawMaterialPayments: 0, salaryExpense: 0, netProfit: 0 };
      row.salaryExpense += sal.totalAmount;
      grouped.set(k, row);
    }

    return Array.from(grouped.values())
      .map((r) => ({ ...r, netProfit: r.totalSales - r.rawMaterialPayments - r.salaryExpense }))
      .sort((a, b) => b.periodLabel.localeCompare(a.periodLabel));
  }
}
