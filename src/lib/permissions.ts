import { UserRole } from "@/types/dto";
import { AppError } from "./errors";

export type ErpModule =
  | "dashboard" | "master_products" | "master_materials" | "master_suppliers"
  | "master_customers" | "master_qc_defects" | "master_users" | "opening_balance"
  | "inventory" | "material_receipt" | "material_issue" | "production"
  | "quality_control" | "stock_transfer" | "offline_sales" | "online_sales"
  | "payments" | "receivables" | "expenses" | "reports" | "audit_log";

export type PermissionAction = "view" | "create" | "update" | "post" | "cancel" | "approve" | "export";

type PermissionMatrix = Record<UserRole, Partial<Record<ErpModule, PermissionAction[]>>>;

export const PERMISSION_MATRIX: PermissionMatrix = {
  BOSS: {
    dashboard: ["view"],
    master_products: ["view", "create", "update"],
    master_materials: ["view", "create", "update"],
    master_suppliers: ["view", "create", "update"],
    master_customers: ["view", "create", "update"],
    master_qc_defects: ["view", "create", "update"],
    master_users: ["view", "create", "update"],
    opening_balance: ["view", "create", "post"],
    inventory: ["view", "create", "post", "export"],
    material_receipt: ["view", "create", "post", "cancel"],
    material_issue: ["view", "create", "post", "cancel"],
    production: ["view", "create", "post", "cancel"],
    quality_control: ["view", "create", "approve", "cancel"],
    stock_transfer: ["view", "create", "post", "cancel"],
    offline_sales: ["view", "create", "post", "cancel", "export"],
    online_sales: ["view", "create", "post", "cancel", "export"],
    payments: ["view", "create", "cancel"],
    receivables: ["view", "export"],
    expenses: ["view", "create", "update"],
    reports: ["view", "export"],
    audit_log: ["view", "export"],
  },
  ADMIN_GUDANG: {
    dashboard: ["view"],
    master_products: ["view"],
    master_materials: ["view"],
    master_suppliers: ["view"],
    master_customers: ["view", "create", "update"],
    master_qc_defects: ["view"],
    inventory: ["view", "create", "post", "export"],
    material_receipt: ["view"],
    material_issue: ["view", "create", "post"],
    production: ["view", "create", "post"],
    quality_control: ["view"],
    stock_transfer: ["view", "create", "post"],
    offline_sales: ["view", "create", "post", "export"],
    payments: ["view", "create"],
    receivables: ["view", "export"],
    reports: ["view", "export"],
  },
  ADMIN_ONLINE_A: {
    dashboard: ["view"],
    master_products: ["view"],
    inventory: ["view"],
    online_sales: ["view", "create", "post", "export"],
    payments: ["view", "create"],
    reports: ["view"],
  },
  ADMIN_ONLINE_B: {
    dashboard: ["view"],
    master_products: ["view"],
    inventory: ["view"],
    online_sales: ["view", "create", "post", "export"],
    payments: ["view", "create"],
    reports: ["view"],
  },
};

export function hasPermission(role: UserRole, module: ErpModule, action: PermissionAction): boolean {
  return (PERMISSION_MATRIX[role]?.[module] ?? []).includes(action);
}

export function requirePermission(role: UserRole | undefined | null, module: ErpModule, action: PermissionAction): void {
  if (!role) throw new AppError("UNAUTHORIZED", "Sesi tidak valid.");
  if (!hasPermission(role, module, action)) {
    throw new AppError("FORBIDDEN", `Role ${role} tidak memiliki izin '${action}' pada '${module}'.`);
  }
}

export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case "BOSS": return "/boss";
    case "ADMIN_GUDANG": return "/gudang";
    case "ADMIN_ONLINE_A": return "/online-a";
    case "ADMIN_ONLINE_B": return "/online-b";
  }
}
