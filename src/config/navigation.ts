import { UserRole } from "@/types/dto";

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  section: string;
}

export const ROLE_NAVIGATION: Record<UserRole, NavItem[]> = {
  BOSS: [
    { section: "Ringkasan", title: "Dashboard Perusahaan", href: "/boss", icon: "LayoutDashboard" },
    { section: "Data Master", title: "Data Produk", href: "/boss/master/produk", icon: "Package" },
    { section: "Data Master", title: "Data Bahan", href: "/boss/master/bahan", icon: "Boxes" },
    { section: "Data Master", title: "Data Supplier", href: "/boss/master/supplier", icon: "Truck" },
    { section: "Data Master", title: "Data Pelanggan", href: "/boss/master/pelanggan", icon: "Users" },
    { section: "Data Master", title: "Kategori Cacat QC", href: "/boss/master/kategori-qc", icon: "AlertTriangle" },
    { section: "Data Master", title: "Saldo Awal Stok", href: "/boss/master/saldo-awal", icon: "ClipboardCheck" },
    { section: "Data Master", title: "Data Pengguna", href: "/boss/master/pengguna", icon: "ShieldCheck" },
    { section: "Operasional", title: "Penerimaan Bahan", href: "/boss/penerimaan-bahan", icon: "ArrowDownToLine" },
    { section: "Operasional", title: "Produksi", href: "/boss/produksi", icon: "Factory" },
    { section: "Operasional", title: "Quality Control", href: "/boss/qc", icon: "CheckCircle2" },
    { section: "Operasional", title: "Stok & Mutasi", href: "/boss/stok", icon: "Warehouse" },
    { section: "Penjualan & Keuangan", title: "Semua Transaksi", href: "/boss/transaksi", icon: "ShoppingCart" },
    { section: "Penjualan & Keuangan", title: "Piutang & Pembayaran", href: "/boss/piutang", icon: "Wallet" },
    { section: "Penjualan & Keuangan", title: "Gaji & Pengeluaran", href: "/boss/pengeluaran", icon: "Receipt" },
    { section: "Analitik", title: "Laporan & Profit", href: "/boss/laporan", icon: "BarChart3" },
    { section: "Analitik", title: "Audit Log", href: "/boss/audit-log", icon: "History" },
  ],
  ADMIN_GUDANG: [
    { section: "Ringkasan", title: "Dashboard Pabrik", href: "/gudang", icon: "LayoutDashboard" },
    { section: "Gudang & Produksi", title: "Stok Gudang", href: "/gudang/stok", icon: "Warehouse" },
    { section: "Gudang & Produksi", title: "Barang Masuk", href: "/gudang/barang-masuk", icon: "ArrowDownToLine" },
    { section: "Gudang & Produksi", title: "Barang Keluar & Produksi", href: "/gudang/produksi", icon: "Factory" },
    { section: "Gudang & Produksi", title: "Transfer Stok Online", href: "/gudang/transfer-online", icon: "ArrowLeftRight" },
    { section: "Penjualan Offline", title: "Transaksi Offline", href: "/gudang/penjualan-offline", icon: "ShoppingBag" },
    { section: "Penjualan Offline", title: "Riwayat Penjualan", href: "/gudang/riwayat-offline", icon: "Receipt" },
    { section: "Penjualan Offline", title: "Data Pelanggan", href: "/gudang/pelanggan", icon: "Users" },
    { section: "Penjualan Offline", title: "Piutang Offline", href: "/gudang/piutang", icon: "Wallet" },
    { section: "Analitik", title: "Laporan Gudang & Offline", href: "/gudang/laporan", icon: "BarChart3" },
  ],
  ADMIN_ONLINE_A: [
    { section: "Online Kanal A", title: "Dashboard Online A", href: "/online-a", icon: "LayoutDashboard" },
    { section: "Online Kanal A", title: "Stok Produk 1 & 2", href: "/online-a/stok", icon: "Package" },
    { section: "Online Kanal A", title: "Transaksi Online A", href: "/online-a/transaksi", icon: "ShoppingCart" },
    { section: "Online Kanal A", title: "Riwayat & Status", href: "/online-a/riwayat", icon: "Receipt" },
  ],
  ADMIN_ONLINE_B: [
    { section: "Online Kanal B", title: "Dashboard Online B", href: "/online-b", icon: "LayoutDashboard" },
    { section: "Online Kanal B", title: "Stok Produk 3 & 4", href: "/online-b/stok", icon: "Package" },
    { section: "Online Kanal B", title: "Transaksi Online B", href: "/online-b/transaksi", icon: "ShoppingCart" },
    { section: "Online Kanal B", title: "Riwayat & Status", href: "/online-b/riwayat", icon: "Receipt" },
  ],
};
