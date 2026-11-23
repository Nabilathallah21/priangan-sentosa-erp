import "server-only";
import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getContainer } from "@/server/container";
import { SalesChannel, StockLocationCode } from "@/types/dto";

async function getSessionRole() {
  const session = await auth();
  return session?.user ?? null;
}

export async function queryDashboardSummary() {
  const user = await getSessionRole();
  requirePermission(user?.role, "dashboard", "view");
  return getContainer().erpService.getDashboardSummary();
}

export async function queryProducts(params: { page?: number; search?: string; onlineChannel?: string } = {}) {
  const user = await getSessionRole();
  requirePermission(user?.role, "master_products", "view");
  const channelFilter =
    user?.role === "ADMIN_ONLINE_A" ? "ONLINE_A" :
    user?.role === "ADMIN_ONLINE_B" ? "ONLINE_B" :
    params.onlineChannel;
  return getContainer().masterRepository.listProducts({
    page: params.page ?? 1,
    pageSize: 20,
    search: params.search,
    filters: channelFilter ? { onlineChannel: channelFilter } : undefined,
  });
}

export async function queryMaterials(params: { page?: number; search?: string } = {}) {
  const user = await getSessionRole();
  requirePermission(user?.role, "master_materials", "view");
  return getContainer().masterRepository.listMaterials({ page: params.page ?? 1, pageSize: 50, search: params.search });
}

export async function querySuppliers(params: { page?: number; search?: string } = {}) {
  const user = await getSessionRole();
  requirePermission(user?.role, "master_suppliers", "view");
  return getContainer().masterRepository.listSuppliers({ page: params.page ?? 1, pageSize: 50, search: params.search });
}

export async function queryCustomers(params: { page?: number; search?: string } = {}) {
  const user = await getSessionRole();
  requirePermission(user?.role, "master_customers", "view");
  return getContainer().masterRepository.listCustomers({ page: params.page ?? 1, pageSize: 50, search: params.search });
}

export async function queryQcDefectCategories() {
  const user = await getSessionRole();
  requirePermission(user?.role, "master_qc_defects", "view");
  return getContainer().masterRepository.listQcDefectCategories();
}

export async function queryUsers(params: { page?: number; search?: string } = {}) {
  const user = await getSessionRole();
  requirePermission(user?.role, "master_users", "view");
  return getContainer().userRepository.listUsers({ page: params.page ?? 1, pageSize: 20, search: params.search });
}

export async function queryStockBalances(params: { page?: number; search?: string; locationCode?: StockLocationCode } = {}) {
  const user = await getSessionRole();
  requirePermission(user?.role, "inventory", "view");
  const forcedLocation: StockLocationCode | undefined =
    user?.role === "ADMIN_ONLINE_A" ? "STOK_ONLINE_A" :
    user?.role === "ADMIN_ONLINE_B" ? "STOK_ONLINE_B" :
    params.locationCode;
  return getContainer().inventoryRepository.listBalances({
    page: params.page ?? 1,
    pageSize: 50,
    search: params.search,
    filters: forcedLocation ? { locationCode: forcedLocation } : undefined,
  });
}

export async function queryInventoryMovements(params: { page?: number; search?: string } = {}) {
  const user = await getSessionRole();
  requirePermission(user?.role, "inventory", "view");
  return getContainer().inventoryRepository.listMovements({ page: params.page ?? 1, pageSize: 20, search: params.search });
}

export async function queryMaterialReceipts(params: { page?: number; search?: string } = {}) {
  const user = await getSessionRole();
  requirePermission(user?.role, "material_receipt", "view");
  return getContainer().operationsRepository.listReceipts({ page: params.page ?? 1, pageSize: 20, search: params.search });
}

export async function queryProductions(params: { page?: number; search?: string; qcCompleted?: boolean } = {}) {
  const user = await getSessionRole();
  requirePermission(user?.role, "production", "view");
  return getContainer().operationsRepository.listProductions({
    page: params.page ?? 1,
    pageSize: 20,
    search: params.search,
    filters: typeof params.qcCompleted === "boolean" ? { qcCompleted: params.qcCompleted } : undefined,
  });
}

export async function queryQcInspections(params: { page?: number; search?: string } = {}) {
  const user = await getSessionRole();
  requirePermission(user?.role, "quality_control", "view");
  return getContainer().operationsRepository.listQcInspections({ page: params.page ?? 1, pageSize: 20, search: params.search });
}

export async function queryStockTransfers(params: { page?: number; search?: string } = {}) {
  const user = await getSessionRole();
  requirePermission(user?.role, "stock_transfer", "view");
  return getContainer().operationsRepository.listTransfers({ page: params.page ?? 1, pageSize: 20, search: params.search });
}

export async function querySales(params: { page?: number; search?: string; channel?: SalesChannel; onlyReceivables?: boolean } = {}) {
  const user = await getSessionRole();
  const effectiveChannel: SalesChannel | undefined =
    user?.role === "ADMIN_ONLINE_A" ? "ONLINE_A" :
    user?.role === "ADMIN_ONLINE_B" ? "ONLINE_B" :
    user?.role === "ADMIN_GUDANG" ? "OFFLINE" :
    params.channel;

  if (effectiveChannel === "OFFLINE") {
    requirePermission(user?.role, "offline_sales", "view");
  } else {
    requirePermission(user?.role, "online_sales", "view");
  }

  const res = await getContainer().salesRepository.listSales({
    page: params.page ?? 1,
    pageSize: 50,
    search: params.search,
    filters: effectiveChannel ? { channel: effectiveChannel } : undefined,
  });

  if (params.onlyReceivables) {
    const filtered = res.items.filter((s) => s.remainingAmount > 0);
    return { ...res, items: filtered, total: filtered.length };
  }
  return res;
}

export async function queryPayments(params: { page?: number; search?: string } = {}) {
  const user = await getSessionRole();
  requirePermission(user?.role, "payments", "view");
  const channelFilter: SalesChannel | undefined =
    user?.role === "ADMIN_ONLINE_A" ? "ONLINE_A" :
    user?.role === "ADMIN_ONLINE_B" ? "ONLINE_B" :
    user?.role === "ADMIN_GUDANG" ? "OFFLINE" : undefined;
  return getContainer().salesRepository.listPayments({
    page: params.page ?? 1,
    pageSize: 30,
    search: params.search,
    filters: channelFilter ? { channel: channelFilter } : undefined,
  });
}

export async function queryMonthlySalaries() {
  const user = await getSessionRole();
  requirePermission(user?.role, "expenses", "view");
  return getContainer().salesRepository.listMonthlySalaries();
}

export async function queryProfitReport(period: "DAILY" | "WEEKLY" | "MONTHLY" = "MONTHLY") {
  const user = await getSessionRole();
  requirePermission(user?.role, "reports", "view");
  return getContainer().erpService.getProfitReport(period);
}

export async function queryAuditLogs(params: { page?: number; search?: string } = {}) {
  const user = await getSessionRole();
  requirePermission(user?.role, "audit_log", "view");
  return getContainer().auditRepository.listLogs({ page: params.page ?? 1, pageSize: 30, search: params.search });
}
