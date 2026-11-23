"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { AppError, toActionError } from "@/lib/errors";
import { getContainer } from "@/server/container";
import { ActionResult } from "@/types/action";
import {
  productSchema, materialSchema, supplierSchema, customerSchema,
  openingBalanceSchema, materialReceiptSchema, productionSchema,
  qcSchema, stockTransferSchema, saleSchema, paymentSchema, monthlySalarySchema
} from "@/lib/validations/erp.schema";

async function requireActor() {
  const session = await auth();
  if (!session?.user) throw new AppError("UNAUTHORIZED", "Silakan login terlebih dahulu.");
  return {
    userId: session.user.id,
    userName: session.user.name ?? session.user.username,
    role: session.user.role,
  };
}

export async function createProductAction(raw: unknown): Promise<ActionResult<unknown>> {
  try {
    const actor = await requireActor();
    requirePermission(actor.role, "master_products", "create");
    const parsed = productSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "Data produk tidak valid.", parsed.error.flatten().fieldErrors);
    }
    const data = await getContainer().erpService.createProduct(actor, parsed.data);
    revalidatePath("/boss/master/produk");
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}

export async function toggleProductAction(id: string, isActive: boolean): Promise<ActionResult<unknown>> {
  try {
    const actor = await requireActor();
    requirePermission(actor.role, "master_products", "update");
    const data = await getContainer().erpService.toggleProductStatus(actor, id, isActive);
    revalidatePath("/boss/master/produk");
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}

export async function createMaterialAction(raw: unknown): Promise<ActionResult<unknown>> {
  try {
    const actor = await requireActor();
    requirePermission(actor.role, "master_materials", "create");
    const parsed = materialSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "Data bahan tidak valid.", parsed.error.flatten().fieldErrors);
    }
    const data = await getContainer().erpService.createMaterial(actor, parsed.data);
    revalidatePath("/boss/master/bahan");
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}

export async function createSupplierAction(raw: unknown): Promise<ActionResult<unknown>> {
  try {
    const actor = await requireActor();
    requirePermission(actor.role, "master_suppliers", "create");
    const parsed = supplierSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "Data supplier tidak valid.", parsed.error.flatten().fieldErrors);
    }
    const data = await getContainer().erpService.createSupplier(actor, parsed.data);
    revalidatePath("/boss/master/supplier");
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}

export async function createCustomerAction(raw: unknown): Promise<ActionResult<unknown>> {
  try {
    const actor = await requireActor();
    requirePermission(actor.role, "master_customers", "create");
    const parsed = customerSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "Data pelanggan tidak valid.", parsed.error.flatten().fieldErrors);
    }
    const data = await getContainer().erpService.createCustomer(actor, parsed.data);
    revalidatePath("/boss/master/pelanggan");
    revalidatePath("/gudang/pelanggan");
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}

export async function createQcDefectAction(name: string): Promise<ActionResult<unknown>> {
  try {
    const actor = await requireActor();
    requirePermission(actor.role, "master_qc_defects", "create");
    if (!name || name.trim().length < 3) {
      throw new AppError("VALIDATION_ERROR", "Nama kategori cacat minimal 3 karakter.");
    }
    const data = await getContainer().erpService.createQcDefectCategory(actor, name.trim());
    revalidatePath("/boss/master/kategori-qc");
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}

export async function postOpeningBalanceAction(raw: unknown): Promise<ActionResult<unknown>> {
  try {
    const actor = await requireActor();
    requirePermission(actor.role, "opening_balance", "post");
    const parsed = openingBalanceSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "Data saldo awal tidak valid.", parsed.error.flatten().fieldErrors);
    }
    const data = await getContainer().erpService.postOpeningBalance(actor, parsed.data);
    revalidatePath("/boss/master/saldo-awal");
    revalidatePath("/boss/stok");
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}

export async function postMaterialReceiptAction(raw: unknown): Promise<ActionResult<unknown>> {
  try {
    const actor = await requireActor();
    requirePermission(actor.role, "material_receipt", "post");
    const parsed = materialReceiptSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "Data penerimaan bahan tidak valid.", parsed.error.flatten().fieldErrors);
    }
    const data = await getContainer().erpService.postMaterialReceipt(actor, parsed.data);
    revalidatePath("/boss/penerimaan-bahan");
    revalidatePath("/gudang/barang-masuk");
    revalidatePath("/boss/stok");
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}

export async function postProductionAction(raw: unknown): Promise<ActionResult<unknown>> {
  try {
    const actor = await requireActor();
    requirePermission(actor.role, "production", "post");
    const parsed = productionSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "Data produksi tidak valid.", parsed.error.flatten().fieldErrors);
    }
    const data = await getContainer().erpService.postProduction(actor, parsed.data);
    revalidatePath("/boss/produksi");
    revalidatePath("/gudang/produksi");
    revalidatePath("/boss/qc");
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}

export async function approveQcAction(raw: unknown): Promise<ActionResult<unknown>> {
  try {
    const actor = await requireActor();
    requirePermission(actor.role, "quality_control", "approve");
    const parsed = qcSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "Data QC tidak valid.", parsed.error.flatten().fieldErrors);
    }
    const data = await getContainer().erpService.approveQcInspection(actor, parsed.data);
    revalidatePath("/boss/qc");
    revalidatePath("/boss/stok");
    revalidatePath("/gudang/stok");
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}

export async function postStockTransferAction(raw: unknown): Promise<ActionResult<unknown>> {
  try {
    const actor = await requireActor();
    requirePermission(actor.role, "stock_transfer", "post");
    const parsed = stockTransferSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "Data transfer stok tidak valid.", parsed.error.flatten().fieldErrors);
    }
    const data = await getContainer().erpService.postStockTransfer(actor, parsed.data);
    revalidatePath("/gudang/transfer-online");
    revalidatePath("/gudang/stok");
    revalidatePath("/online-a/stok");
    revalidatePath("/online-b/stok");
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}

export async function postSaleAction(raw: unknown): Promise<ActionResult<unknown>> {
  try {
    const actor = await requireActor();
    const parsed = saleSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "Data transaksi penjualan tidak valid.", parsed.error.flatten().fieldErrors);
    }
    if (parsed.data.channel === "OFFLINE") {
      requirePermission(actor.role, "offline_sales", "post");
    } else {
      requirePermission(actor.role, "online_sales", "post");
    }
    const data = await getContainer().erpService.postSale(actor, parsed.data);
    revalidatePath("/gudang/penjualan-offline");
    revalidatePath("/gudang/riwayat-offline");
    revalidatePath("/gudang/piutang");
    revalidatePath("/online-a/transaksi");
    revalidatePath("/online-a/riwayat");
    revalidatePath("/online-b/transaksi");
    revalidatePath("/online-b/riwayat");
    revalidatePath("/boss/transaksi");
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}

export async function recordPaymentAction(raw: unknown): Promise<ActionResult<unknown>> {
  try {
    const actor = await requireActor();
    requirePermission(actor.role, "payments", "create");
    const parsed = paymentSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "Data pembayaran tidak valid.", parsed.error.flatten().fieldErrors);
    }
    const data = await getContainer().erpService.recordPayment(actor, parsed.data);
    revalidatePath("/gudang/piutang");
    revalidatePath("/boss/piutang");
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateOnlineOrderStatusAction(
  saleId: string,
  orderStatus: "PENDING" | "PACKED" | "SHIPPED" | "COMPLETED" | "CANCELLED"
): Promise<ActionResult<unknown>> {
  try {
    const actor = await requireActor();
    requirePermission(actor.role, "online_sales", "post");
    const data = await getContainer().erpService.updateOnlineOrderStatus(actor, saleId, orderStatus);
    revalidatePath("/online-a/riwayat");
    revalidatePath("/online-b/riwayat");
    revalidatePath("/boss/transaksi");
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}

export async function saveMonthlySalaryAction(raw: unknown): Promise<ActionResult<unknown>> {
  try {
    const actor = await requireActor();
    requirePermission(actor.role, "expenses", "create");
    const parsed = monthlySalarySchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "Data gaji bulanan tidak valid.", parsed.error.flatten().fieldErrors);
    }
    const data = await getContainer().erpService.saveMonthlySalary(actor, parsed.data);
    revalidatePath("/boss/pengeluaran");
    revalidatePath("/boss/laporan");
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}

export async function createUserAction(raw: {
  name: string; username: string; email: string; password: string;
  role: "BOSS" | "ADMIN_GUDANG" | "ADMIN_ONLINE_A" | "ADMIN_ONLINE_B";
}): Promise<ActionResult<unknown>> {
  try {
    const actor = await requireActor();
    requirePermission(actor.role, "master_users", "create");
    if (!raw.name || raw.name.trim().length < 3) throw new AppError("VALIDATION_ERROR", "Nama lengkap minimal 3 karakter.");
    if (!raw.username || raw.username.trim().length < 3) throw new AppError("VALIDATION_ERROR", "Username minimal 3 karakter.");
    if (!raw.email || !raw.email.includes("@")) throw new AppError("VALIDATION_ERROR", "Format email tidak valid.");
    if (!raw.password || raw.password.length < 6) throw new AppError("VALIDATION_ERROR", "Password minimal 6 karakter.");
    const data = await getContainer().erpService.createUser(actor, raw);
    revalidatePath("/boss/master/pengguna");
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}

export async function toggleUserStatusAction(id: string, isActive: boolean): Promise<ActionResult<unknown>> {
  try {
    const actor = await requireActor();
    requirePermission(actor.role, "master_users", "update");
    const data = await getContainer().erpService.toggleUserStatus(actor, id, isActive);
    revalidatePath("/boss/master/pengguna");
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}
