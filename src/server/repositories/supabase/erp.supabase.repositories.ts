import "server-only";
import {
  MasterDataRepository, InventoryRepository, OperationsRepository,
  SalesAndFinanceRepository, AuditLogRepository
} from "../contracts/erp.repositories";
import {
  ProductMasterDTO, MaterialMasterDTO, SupplierDTO, CustomerDTO, QcDefectCategoryDTO,
  StockBalanceDTO, InventoryMovementDTO, MaterialReceiptDTO, ProductionOrderDTO,
  QcInspectionDTO, StockTransferDTO, SaleDTO, PaymentDTO, MonthlySalaryDTO,
  AuditLogDTO, StockLocationCode, SalesChannel, OnlineChannel
} from "@/types/dto";
import { PaginatedQuery, PaginatedResult } from "@/types/pagination";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { AppError } from "@/lib/errors";

function pageRange(query: PaginatedQuery) {
  const page = Math.max(1, query.page || 1);
  const pageSize = Math.max(1, query.pageSize || 20);
  const from = (page - 1) * pageSize;
  return { page, pageSize, from, to: from + pageSize - 1 };
}

function mapProduct(r: Record<string, unknown>): ProductMasterDTO {
  return {
    id: String(r.id),
    code: String(r.code),
    name: String(r.name),
    category: String(r.category),
    unit: String(r.unit),
    defaultPrice: Number(r.default_price),
    minStock: Number(r.min_stock),
    onlineChannel: r.online_channel as OnlineChannel,
    isActive: Boolean(r.is_active),
    createdAt: String(r.created_at),
  };
}

function mapMaterial(r: Record<string, unknown>): MaterialMasterDTO {
  return {
    id: String(r.id),
    code: String(r.code),
    name: String(r.name),
    materialType: r.material_type as "BAHAN_BAKU" | "BAHAN_PELENGKAP",
    category: String(r.category),
    unit: String(r.unit),
    minStock: Number(r.min_stock),
    isActive: Boolean(r.is_active),
    createdAt: String(r.created_at),
  };
}

function mapBalance(r: Record<string, unknown>): StockBalanceDTO {
  return {
    id: String(r.id),
    itemType: r.item_type as "MATERIAL" | "PRODUCT",
    itemId: String(r.item_id),
    itemCode: String(r.item_code),
    itemName: String(r.item_name),
    unit: String(r.unit),
    locationCode: r.location_code as StockLocationCode,
    physicalQty: Number(r.physical_qty),
    allocatedQty: Number(r.allocated_qty),
    availableQty: Number(r.available_qty),
    minStock: Number(r.min_stock),
    onlineChannel: (r.online_channel as OnlineChannel | undefined) ?? undefined,
  };
}

function mapSale(r: Record<string, unknown>): SaleDTO {
  return {
    id: String(r.id),
    invoiceNumber: String(r.invoice_number),
    saleDate: String(r.sale_date),
    channel: r.channel as SalesChannel,
    customerId: r.customer_id ? String(r.customer_id) : undefined,
    customerName: String(r.customer_name),
    marketplaceOrderRef: r.marketplace_order_ref ? String(r.marketplace_order_ref) : undefined,
    orderStatus: r.order_status as SaleDTO["orderStatus"],
    paymentStatus: r.payment_status as SaleDTO["paymentStatus"],
    items: (r.items as SaleDTO["items"]) ?? [],
    totalAmount: Number(r.total_amount),
    paidAmount: Number(r.paid_amount),
    remainingAmount: Number(r.remaining_amount),
    notes: r.notes ? String(r.notes) : undefined,
    status: r.status as SaleDTO["status"],
    createdByName: String(r.created_by_name),
  };
}

export class SupabaseMasterDataRepository implements MasterDataRepository {
  async listProducts(query: PaginatedQuery<{ onlineChannel?: string; isActive?: boolean }>): Promise<PaginatedResult<ProductMasterDTO>> {
    const sb = getSupabaseAdmin();
    const { page, pageSize, from, to } = pageRange(query);
    let req = sb.from("products").select("*", { count: "exact" }).order("created_at", { ascending: false });
    if (query.search) req = req.or(`code.ilike.%${query.search}%,name.ilike.%${query.search}%,category.ilike.%${query.search}%`);
    if (query.filters?.onlineChannel) req = req.eq("online_channel", query.filters.onlineChannel);
    if (typeof query.filters?.isActive === "boolean") req = req.eq("is_active", query.filters.isActive);
    const { data, count, error } = await req.range(from, to);
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return { items: (data ?? []).map(mapProduct), total: count ?? 0, page, pageSize };
  }

  async getProductById(id: string): Promise<ProductMasterDTO | null> {
    const { data } = await getSupabaseAdmin().from("products").select("*").eq("id", id).maybeSingle();
    return data ? mapProduct(data) : null;
  }

  async createProduct(data: Omit<ProductMasterDTO, "id" | "createdAt">): Promise<ProductMasterDTO> {
    const { data: inserted, error } = await getSupabaseAdmin().from("products").insert({
      code: data.code,
      name: data.name,
      category: data.category,
      unit: data.unit,
      default_price: data.defaultPrice,
      min_stock: data.minStock,
      online_channel: data.onlineChannel,
      is_active: data.isActive,
    }).select("*").single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return mapProduct(inserted);
  }

  async updateProduct(id: string, data: Partial<ProductMasterDTO>): Promise<ProductMasterDTO> {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.category !== undefined) payload.category = data.category;
    if (data.unit !== undefined) payload.unit = data.unit;
    if (data.defaultPrice !== undefined) payload.default_price = data.defaultPrice;
    if (data.minStock !== undefined) payload.min_stock = data.minStock;
    if (data.onlineChannel !== undefined) payload.online_channel = data.onlineChannel;
    if (data.isActive !== undefined) payload.is_active = data.isActive;
    const { data: updated, error } = await getSupabaseAdmin().from("products").update(payload).eq("id", id).select("*").single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return mapProduct(updated);
  }

  async listMaterials(query: PaginatedQuery<{ materialType?: string; isActive?: boolean }>): Promise<PaginatedResult<MaterialMasterDTO>> {
    const sb = getSupabaseAdmin();
    const { page, pageSize, from, to } = pageRange(query);
    let req = sb.from("materials").select("*", { count: "exact" }).order("created_at", { ascending: false });
    if (query.search) req = req.or(`code.ilike.%${query.search}%,name.ilike.%${query.search}%`);
    if (query.filters?.materialType) req = req.eq("material_type", query.filters.materialType);
    if (typeof query.filters?.isActive === "boolean") req = req.eq("is_active", query.filters.isActive);
    const { data, count, error } = await req.range(from, to);
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return { items: (data ?? []).map(mapMaterial), total: count ?? 0, page, pageSize };
  }

  async getMaterialById(id: string): Promise<MaterialMasterDTO | null> {
    const { data } = await getSupabaseAdmin().from("materials").select("*").eq("id", id).maybeSingle();
    return data ? mapMaterial(data) : null;
  }

  async createMaterial(data: Omit<MaterialMasterDTO, "id" | "createdAt">): Promise<MaterialMasterDTO> {
    const { data: inserted, error } = await getSupabaseAdmin().from("materials").insert({
      code: data.code,
      name: data.name,
      material_type: data.materialType,
      category: data.category,
      unit: data.unit,
      min_stock: data.minStock,
      is_active: data.isActive,
    }).select("*").single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return mapMaterial(inserted);
  }

  async updateMaterial(id: string, data: Partial<MaterialMasterDTO>): Promise<MaterialMasterDTO> {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.isActive !== undefined) payload.is_active = data.isActive;
    const { data: updated, error } = await getSupabaseAdmin().from("materials").update(payload).eq("id", id).select("*").single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return mapMaterial(updated);
  }

  async listSuppliers(query: PaginatedQuery): Promise<PaginatedResult<SupplierDTO>> {
    const { page, pageSize, from, to } = pageRange(query);
    let req = getSupabaseAdmin().from("suppliers").select("*", { count: "exact" }).order("name");
    if (query.search) req = req.or(`name.ilike.%${query.search}%,contact.ilike.%${query.search}%`);
    const { data, count, error } = await req.range(from, to);
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return {
      items: (data ?? []).map((r) => ({
        id: r.id, name: r.name, contact: r.contact, address: r.address, notes: r.notes ?? undefined, isActive: r.is_active,
      })),
      total: count ?? 0, page, pageSize,
    };
  }

  async createSupplier(data: Omit<SupplierDTO, "id">): Promise<SupplierDTO> {
    const { data: r, error } = await getSupabaseAdmin().from("suppliers").insert({
      name: data.name, contact: data.contact, address: data.address, notes: data.notes, is_active: data.isActive,
    }).select("*").single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return { id: r.id, name: r.name, contact: r.contact, address: r.address, notes: r.notes ?? undefined, isActive: r.is_active };
  }

  async updateSupplier(id: string, data: Partial<SupplierDTO>): Promise<SupplierDTO> {
    const { data: r, error } = await getSupabaseAdmin().from("suppliers").update({
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.isActive !== undefined ? { is_active: data.isActive } : {}),
    }).eq("id", id).select("*").single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return { id: r.id, name: r.name, contact: r.contact, address: r.address, notes: r.notes ?? undefined, isActive: r.is_active };
  }

  async listCustomers(query: PaginatedQuery): Promise<PaginatedResult<CustomerDTO>> {
    const { page, pageSize, from, to } = pageRange(query);
    let req = getSupabaseAdmin().from("customers").select("*", { count: "exact" }).order("name");
    if (query.search) req = req.or(`name.ilike.%${query.search}%,contact.ilike.%${query.search}%`);
    const { data, count, error } = await req.range(from, to);
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return {
      items: (data ?? []).map((r) => ({
        id: r.id, name: r.name, contact: r.contact, address: r.address,
        creditLimit: Number(r.credit_limit ?? 0), notes: r.notes ?? undefined, isActive: r.is_active,
      })),
      total: count ?? 0, page, pageSize,
    };
  }

  async createCustomer(data: Omit<CustomerDTO, "id">): Promise<CustomerDTO> {
    const { data: r, error } = await getSupabaseAdmin().from("customers").insert({
      name: data.name, contact: data.contact, address: data.address,
      credit_limit: data.creditLimit ?? 0, notes: data.notes, is_active: data.isActive,
    }).select("*").single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return { id: r.id, name: r.name, contact: r.contact, address: r.address, creditLimit: Number(r.credit_limit ?? 0), notes: r.notes ?? undefined, isActive: r.is_active };
  }

  async updateCustomer(id: string, data: Partial<CustomerDTO>): Promise<CustomerDTO> {
    const { data: r, error } = await getSupabaseAdmin().from("customers").update({
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.isActive !== undefined ? { is_active: data.isActive } : {}),
    }).eq("id", id).select("*").single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return { id: r.id, name: r.name, contact: r.contact, address: r.address, creditLimit: Number(r.credit_limit ?? 0), notes: r.notes ?? undefined, isActive: r.is_active };
  }

  async listQcDefectCategories(): Promise<QcDefectCategoryDTO[]> {
    const { data, error } = await getSupabaseAdmin().from("qc_defect_categories").select("*").order("name");
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return (data ?? []).map((r) => ({ id: r.id, name: r.name, isActive: r.is_active }));
  }

  async createQcDefectCategory(name: string): Promise<QcDefectCategoryDTO> {
    const { data: r, error } = await getSupabaseAdmin().from("qc_defect_categories").insert({ name, is_active: true }).select("*").single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return { id: r.id, name: r.name, isActive: r.is_active };
  }

  async toggleQcDefectCategory(id: string, isActive: boolean): Promise<QcDefectCategoryDTO> {
    const { data: r, error } = await getSupabaseAdmin().from("qc_defect_categories").update({ is_active: isActive }).eq("id", id).select("*").single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return { id: r.id, name: r.name, isActive: r.is_active };
  }
}

export class SupabaseInventoryRepository implements InventoryRepository {
  async listBalances(query: PaginatedQuery<{ locationCode?: StockLocationCode; itemType?: "MATERIAL" | "PRODUCT"; onlineChannel?: string }>): Promise<PaginatedResult<StockBalanceDTO>> {
    const { page, pageSize, from, to } = pageRange(query);
    let req = getSupabaseAdmin().from("stock_balances").select("*", { count: "exact" }).order("item_code");
    if (query.search) req = req.or(`item_code.ilike.%${query.search}%,item_name.ilike.%${query.search}%`);
    if (query.filters?.locationCode) req = req.eq("location_code", query.filters.locationCode);
    if (query.filters?.itemType) req = req.eq("item_type", query.filters.itemType);
    if (query.filters?.onlineChannel) req = req.eq("online_channel", query.filters.onlineChannel);
    const { data, count, error } = await req.range(from, to);
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return { items: (data ?? []).map(mapBalance), total: count ?? 0, page, pageSize };
  }

  async getBalance(itemType: "MATERIAL" | "PRODUCT", itemId: string, locationCode: StockLocationCode): Promise<StockBalanceDTO | null> {
    const { data } = await getSupabaseAdmin()
      .from("stock_balances")
      .select("*")
      .eq("item_type", itemType)
      .eq("item_id", itemId)
      .eq("location_code", locationCode)
      .maybeSingle();
    return data ? mapBalance(data) : null;
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
    const sb = getSupabaseAdmin();
    const existing = await this.getBalance(params.itemType, params.itemId, params.locationCode);
    const nextPhysical = (existing?.physicalQty ?? 0) + params.deltaPhysical;
    const allocated = existing?.allocatedQty ?? 0;
    const nextAvailable = nextPhysical - allocated;

    if (nextPhysical < 0 || nextAvailable < 0) {
      throw new AppError("INSUFFICIENT_STOCK", `Stok ${params.itemName} tidak mencukupi.`);
    }

    if (existing) {
      const { data, error } = await sb
        .from("stock_balances")
        .update({ physical_qty: nextPhysical, available_qty: nextAvailable })
        .eq("id", existing.id)
        .select("*")
        .single();
      if (error) throw new AppError("INTERNAL_ERROR", error.message);
      return mapBalance(data);
    }

    const { data, error } = await sb
      .from("stock_balances")
      .insert({
        item_type: params.itemType,
        item_id: params.itemId,
        item_code: params.itemCode,
        item_name: params.itemName,
        unit: params.unit,
        location_code: params.locationCode,
        physical_qty: nextPhysical,
        allocated_qty: 0,
        available_qty: nextAvailable,
        min_stock: params.minStock,
        online_channel: params.onlineChannel ?? null,
      })
      .select("*")
      .single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return mapBalance(data);
  }

  async appendMovement(movement: Omit<InventoryMovementDTO, "id">): Promise<InventoryMovementDTO> {
    const { data, error } = await getSupabaseAdmin()
      .from("inventory_movements")
      .insert({
        movement_date: movement.movementDate,
        item_type: movement.itemType,
        item_id: movement.itemId,
        item_code: movement.itemCode,
        item_name: movement.itemName,
        location_code: movement.locationCode,
        direction: movement.direction,
        qty: movement.qty,
        balance_after: movement.balanceAfter,
        ref_type: movement.refType,
        ref_number: movement.refNumber,
        notes: movement.notes ?? null,
        actor_name: movement.actorName,
      })
      .select("*")
      .single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return {
      id: data.id,
      movementDate: data.movement_date,
      itemType: data.item_type,
      itemId: data.item_id,
      itemCode: data.item_code,
      itemName: data.item_name,
      locationCode: data.location_code,
      direction: data.direction,
      qty: Number(data.qty),
      balanceAfter: Number(data.balance_after),
      refType: data.ref_type,
      refNumber: data.ref_number,
      notes: data.notes ?? undefined,
      actorName: data.actor_name,
    };
  }

  async listMovements(query: PaginatedQuery<{ locationCode?: StockLocationCode; itemId?: string }>): Promise<PaginatedResult<InventoryMovementDTO>> {
    const { page, pageSize, from, to } = pageRange(query);
    let req = getSupabaseAdmin().from("inventory_movements").select("*", { count: "exact" }).order("movement_date", { ascending: false });
    if (query.search) req = req.or(`ref_number.ilike.%${query.search}%,item_name.ilike.%${query.search}%,item_code.ilike.%${query.search}%`);
    if (query.filters?.locationCode) req = req.eq("location_code", query.filters.locationCode);
    if (query.filters?.itemId) req = req.eq("item_id", query.filters.itemId);
    const { data, count, error } = await req.range(from, to);
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return {
      items: (data ?? []).map((r) => ({
        id: r.id, movementDate: r.movement_date, itemType: r.item_type, itemId: r.item_id,
        itemCode: r.item_code, itemName: r.item_name, locationCode: r.location_code,
        direction: r.direction, qty: Number(r.qty), balanceAfter: Number(r.balance_after),
        refType: r.ref_type, refNumber: r.ref_number, notes: r.notes ?? undefined, actorName: r.actor_name,
      })),
      total: count ?? 0, page, pageSize,
    };
  }
}

export class SupabaseOperationsRepository implements OperationsRepository {
  async listReceipts(query: PaginatedQuery): Promise<PaginatedResult<MaterialReceiptDTO>> {
    const { page, pageSize, from, to } = pageRange(query);
    let req = getSupabaseAdmin().from("material_receipts").select("*", { count: "exact" }).order("receipt_date", { ascending: false });
    if (query.search) req = req.or(`receipt_number.ilike.%${query.search}%,supplier_name.ilike.%${query.search}%,material_name.ilike.%${query.search}%`);
    const { data, count, error } = await req.range(from, to);
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return {
      items: (data ?? []).map((r) => ({
        id: r.id, receiptNumber: r.receipt_number, receiptDate: r.receipt_date,
        supplierId: r.supplier_id, supplierName: r.supplier_name, materialId: r.material_id,
        materialCode: r.material_code, materialName: r.material_name, materialType: r.material_type,
        unit: r.unit, qty: Number(r.qty), unitPrice: Number(r.unit_price), totalAmount: Number(r.total_amount),
        externalDocNumber: r.external_doc_number, notes: r.notes ?? undefined, status: r.status, createdByName: r.created_by_name,
      })),
      total: count ?? 0, page, pageSize,
    };
  }

  async createReceipt(data: Omit<MaterialReceiptDTO, "id">): Promise<MaterialReceiptDTO> {
    const { data: r, error } = await getSupabaseAdmin().from("material_receipts").insert({
      receipt_number: data.receiptNumber, receipt_date: data.receiptDate,
      supplier_id: data.supplierId, supplier_name: data.supplierName,
      material_id: data.materialId, material_code: data.materialCode,
      material_name: data.materialName, material_type: data.materialType,
      unit: data.unit, qty: data.qty, unit_price: data.unitPrice, total_amount: data.totalAmount,
      external_doc_number: data.externalDocNumber, notes: data.notes ?? null,
      status: data.status, created_by_name: data.createdByName,
    }).select("*").single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return { ...data, id: r.id };
  }

  async listProductions(query: PaginatedQuery<{ qcCompleted?: boolean }>): Promise<PaginatedResult<ProductionOrderDTO>> {
    const { page, pageSize, from, to } = pageRange(query);
    let req = getSupabaseAdmin().from("production_orders").select("*", { count: "exact" }).order("production_date", { ascending: false });
    if (query.search) req = req.or(`production_number.ilike.%${query.search}%,batch_code.ilike.%${query.search}%,product_name.ilike.%${query.search}%`);
    if (typeof query.filters?.qcCompleted === "boolean") req = req.eq("qc_completed", query.filters.qcCompleted);
    const { data, count, error } = await req.range(from, to);
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return {
      items: (data ?? []).map((r) => ({
        id: r.id, productionNumber: r.production_number, productionDate: r.production_date,
        batchCode: r.batch_code, productId: r.product_id, productCode: r.product_code,
        productName: r.product_name, unit: r.unit, targetQty: Number(r.target_qty),
        actualQty: Number(r.actual_qty), materialsUsed: r.materials_used ?? [],
        picName: r.pic_name, notes: r.notes ?? undefined, status: r.status, qcCompleted: r.qc_completed,
      })),
      total: count ?? 0, page, pageSize,
    };
  }

  async getProductionById(id: string): Promise<ProductionOrderDTO | null> {
    const { data: r } = await getSupabaseAdmin().from("production_orders").select("*").eq("id", id).maybeSingle();
    if (!r) return null;
    return {
      id: r.id, productionNumber: r.production_number, productionDate: r.production_date,
      batchCode: r.batch_code, productId: r.product_id, productCode: r.product_code,
      productName: r.product_name, unit: r.unit, targetQty: Number(r.target_qty),
      actualQty: Number(r.actual_qty), materialsUsed: r.materials_used ?? [],
      picName: r.pic_name, notes: r.notes ?? undefined, status: r.status, qcCompleted: r.qc_completed,
    };
  }

  async createProduction(data: Omit<ProductionOrderDTO, "id">): Promise<ProductionOrderDTO> {
    const { data: r, error } = await getSupabaseAdmin().from("production_orders").insert({
      production_number: data.productionNumber, production_date: data.productionDate,
      batch_code: data.batchCode, product_id: data.productId, product_code: data.productCode,
      product_name: data.productName, unit: data.unit, target_qty: data.targetQty,
      actual_qty: data.actualQty, materials_used: data.materialsUsed,
      pic_name: data.picName, notes: data.notes ?? null, status: data.status, qc_completed: data.qcCompleted,
    }).select("*").single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return { ...data, id: r.id };
  }

  async markProductionQcCompleted(id: string): Promise<void> {
    const { error } = await getSupabaseAdmin().from("production_orders").update({ qc_completed: true }).eq("id", id);
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
  }

  async listQcInspections(query: PaginatedQuery): Promise<PaginatedResult<QcInspectionDTO>> {
    const { page, pageSize, from, to } = pageRange(query);
    let req = getSupabaseAdmin().from("qc_inspections").select("*", { count: "exact" }).order("inspection_date", { ascending: false });
    if (query.search) req = req.or(`qc_number.ilike.%${query.search}%,batch_code.ilike.%${query.search}%`);
    const { data, count, error } = await req.range(from, to);
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return {
      items: (data ?? []).map((r) => ({
        id: r.id, qcNumber: r.qc_number, inspectionDate: r.inspection_date,
        productionId: r.production_id, productionNumber: r.production_number, batchCode: r.batch_code,
        productId: r.product_id, productCode: r.product_code, productName: r.product_name,
        inspectedQty: Number(r.inspected_qty), okQty: Number(r.ok_qty), ngQty: Number(r.ng_qty),
        defectCategoryId: r.defect_category_id ?? undefined, defectCategoryName: r.defect_category_name ?? undefined,
        inspectorName: r.inspector_name, notes: r.notes ?? undefined, status: r.status,
      })),
      total: count ?? 0, page, pageSize,
    };
  }

  async createQcInspection(data: Omit<QcInspectionDTO, "id">): Promise<QcInspectionDTO> {
    const { data: r, error } = await getSupabaseAdmin().from("qc_inspections").insert({
      qc_number: data.qcNumber, inspection_date: data.inspectionDate,
      production_id: data.productionId, production_number: data.productionNumber, batch_code: data.batchCode,
      product_id: data.productId, product_code: data.productCode, product_name: data.productName,
      inspected_qty: data.inspectedQty, ok_qty: data.okQty, ng_qty: data.ngQty,
      defect_category_id: data.defectCategoryId ?? null, defect_category_name: data.defectCategoryName ?? null,
      inspector_name: data.inspectorName, notes: data.notes ?? null, status: data.status,
    }).select("*").single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return { ...data, id: r.id };
  }

  async listTransfers(query: PaginatedQuery): Promise<PaginatedResult<StockTransferDTO>> {
    const { page, pageSize, from, to } = pageRange(query);
    let req = getSupabaseAdmin().from("stock_transfers").select("*", { count: "exact" }).order("transfer_date", { ascending: false });
    if (query.search) req = req.or(`transfer_number.ilike.%${query.search}%,product_name.ilike.%${query.search}%`);
    const { data, count, error } = await req.range(from, to);
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return {
      items: (data ?? []).map((r) => ({
        id: r.id, transferNumber: r.transfer_number, transferDate: r.transfer_date,
        fromLocation: r.from_location, toLocation: r.to_location,
        productId: r.product_id, productCode: r.product_code, productName: r.product_name,
        qty: Number(r.qty), picName: r.pic_name, notes: r.notes ?? undefined, status: r.status,
      })),
      total: count ?? 0, page, pageSize,
    };
  }

  async createTransfer(data: Omit<StockTransferDTO, "id">): Promise<StockTransferDTO> {
    const { data: r, error } = await getSupabaseAdmin().from("stock_transfers").insert({
      transfer_number: data.transferNumber, transfer_date: data.transferDate,
      from_location: data.fromLocation, to_location: data.toLocation,
      product_id: data.productId, product_code: data.productCode, product_name: data.productName,
      qty: data.qty, pic_name: data.picName, notes: data.notes ?? null, status: data.status,
    }).select("*").single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return { ...data, id: r.id };
  }
}

export class SupabaseSalesAndFinanceRepository implements SalesAndFinanceRepository {
  async listSales(query: PaginatedQuery<{ channel?: SalesChannel; paymentStatus?: string }>): Promise<PaginatedResult<SaleDTO>> {
    const { page, pageSize, from, to } = pageRange(query);
    let req = getSupabaseAdmin().from("sales").select("*", { count: "exact" }).order("sale_date", { ascending: false });
    if (query.search) req = req.or(`invoice_number.ilike.%${query.search}%,customer_name.ilike.%${query.search}%`);
    if (query.filters?.channel) req = req.eq("channel", query.filters.channel);
    if (query.filters?.paymentStatus) req = req.eq("payment_status", query.filters.paymentStatus);
    const { data, count, error } = await req.range(from, to);
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return { items: (data ?? []).map(mapSale), total: count ?? 0, page, pageSize };
  }

  async getSaleById(id: string): Promise<SaleDTO | null> {
    const { data } = await getSupabaseAdmin().from("sales").select("*").eq("id", id).maybeSingle();
    return data ? mapSale(data) : null;
  }

  async createSale(data: Omit<SaleDTO, "id">): Promise<SaleDTO> {
    const { data: r, error } = await getSupabaseAdmin().from("sales").insert({
      invoice_number: data.invoiceNumber, sale_date: data.saleDate, channel: data.channel,
      customer_id: data.customerId ?? null, customer_name: data.customerName,
      marketplace_order_ref: data.marketplaceOrderRef ?? null, order_status: data.orderStatus,
      payment_status: data.paymentStatus, items: data.items,
      total_amount: data.totalAmount, paid_amount: data.paidAmount, remaining_amount: data.remainingAmount,
      notes: data.notes ?? null, status: data.status, created_by_name: data.createdByName,
    }).select("*").single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return mapSale(r);
  }

  async updateSalePayment(saleId: string, paidAmount: number, remainingAmount: number, paymentStatus: SaleDTO["paymentStatus"]): Promise<SaleDTO> {
    const { data: r, error } = await getSupabaseAdmin()
      .from("sales")
      .update({ paid_amount: paidAmount, remaining_amount: remainingAmount, payment_status: paymentStatus })
      .eq("id", saleId)
      .select("*")
      .single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return mapSale(r);
  }

  async updateSaleOrderStatus(saleId: string, orderStatus: SaleDTO["orderStatus"]): Promise<SaleDTO> {
    const { data: r, error } = await getSupabaseAdmin()
      .from("sales")
      .update({ order_status: orderStatus })
      .eq("id", saleId)
      .select("*")
      .single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return mapSale(r);
  }

  async listPayments(query: PaginatedQuery<{ channel?: SalesChannel }>): Promise<PaginatedResult<PaymentDTO>> {
    const { page, pageSize, from, to } = pageRange(query);
    let req = getSupabaseAdmin().from("payments").select("*", { count: "exact" }).order("payment_date", { ascending: false });
    if (query.search) req = req.or(`payment_number.ilike.%${query.search}%,invoice_number.ilike.%${query.search}%,customer_name.ilike.%${query.search}%`);
    if (query.filters?.channel) req = req.eq("channel", query.filters.channel);
    const { data, count, error } = await req.range(from, to);
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return {
      items: (data ?? []).map((r) => ({
        id: r.id, paymentNumber: r.payment_number, paymentDate: r.payment_date,
        saleId: r.sale_id, invoiceNumber: r.invoice_number, customerName: r.customer_name,
        channel: r.channel, amount: Number(r.amount), method: r.method,
        notes: r.notes ?? undefined, recordedByName: r.recorded_by_name,
      })),
      total: count ?? 0, page, pageSize,
    };
  }

  async createPayment(data: Omit<PaymentDTO, "id">): Promise<PaymentDTO> {
    const { data: r, error } = await getSupabaseAdmin().from("payments").insert({
      payment_number: data.paymentNumber, payment_date: data.paymentDate,
      sale_id: data.saleId, invoice_number: data.invoiceNumber,
      customer_name: data.customerName, channel: data.channel,
      amount: data.amount, method: data.method,
      notes: data.notes ?? null, recorded_by_name: data.recordedByName,
    }).select("*").single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return { ...data, id: r.id };
  }

  async listMonthlySalaries(): Promise<MonthlySalaryDTO[]> {
    const { data, error } = await getSupabaseAdmin().from("monthly_salaries").select("*").order("month_key", { ascending: false });
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return (data ?? []).map((r) => ({
      id: r.id, monthKey: r.month_key, totalAmount: Number(r.total_amount),
      notes: r.notes ?? undefined, updatedAt: r.updated_at, recordedByName: r.recorded_by_name,
    }));
  }

  async upsertMonthlySalary(data: Omit<MonthlySalaryDTO, "id">): Promise<MonthlySalaryDTO> {
    const { data: r, error } = await getSupabaseAdmin().from("monthly_salaries").upsert({
      month_key: data.monthKey,
      total_amount: data.totalAmount,
      notes: data.notes ?? null,
      updated_at: data.updatedAt,
      recorded_by_name: data.recordedByName,
    }, { onConflict: "month_key" }).select("*").single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return { id: r.id, monthKey: r.month_key, totalAmount: Number(r.total_amount), notes: r.notes ?? undefined, updatedAt: r.updated_at, recordedByName: r.recorded_by_name };
  }
}

export class SupabaseAuditLogRepository implements AuditLogRepository {
  async appendLog(entry: Omit<AuditLogDTO, "id">): Promise<AuditLogDTO> {
    const { data: r, error } = await getSupabaseAdmin().from("audit_logs").insert({
      actor_id: entry.actorId, actor_name: entry.actorName, actor_role: entry.actorRole,
      module: entry.module, action: entry.action, entity_id: entry.entityId,
      old_value: entry.oldValue ?? null, new_value: entry.newValue ?? null,
      created_at: entry.createdAt,
    }).select("*").single();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return { ...entry, id: r.id };
  }

  async listLogs(query: PaginatedQuery<{ module?: string }>): Promise<PaginatedResult<AuditLogDTO>> {
    const { page, pageSize, from, to } = pageRange(query);
    let req = getSupabaseAdmin().from("audit_logs").select("*", { count: "exact" }).order("created_at", { ascending: false });
    if (query.search) req = req.or(`actor_name.ilike.%${query.search}%,action.ilike.%${query.search}%,module.ilike.%${query.search}%`);
    if (query.filters?.module) req = req.eq("module", query.filters.module);
    const { data, count, error } = await req.range(from, to);
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return {
      items: (data ?? []).map((r) => ({
        id: r.id, actorId: r.actor_id, actorName: r.actor_name, actorRole: r.actor_role,
        module: r.module, action: r.action, entityId: r.entity_id,
        oldValue: r.old_value ?? undefined, newValue: r.new_value ?? undefined, createdAt: r.created_at,
      })),
      total: count ?? 0, page, pageSize,
    };
  }
}