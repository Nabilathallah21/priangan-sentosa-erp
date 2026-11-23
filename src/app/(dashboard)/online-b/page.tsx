import { Package, ShoppingCart } from "lucide-react";
import { queryStockBalances, querySales } from "@/server/queries/erp.queries";
import { StatCard } from "@/components/shared/StatCard";
import { formatRupiah } from "@/lib/utils";

export default async function OnlineBDashboardPage() {
  const [stok, sales] = await Promise.all([queryStockBalances(), querySales({ channel: "ONLINE_B" })]);
  const totalUnit = stok.items.reduce((a, b) => a + b.availableQty, 0);
  const totalOmzet = sales.items.reduce((a, b) => a + b.totalAmount, 0);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1F2937]">Dashboard Admin Online B (Produk 3 &amp; 4)</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Stok Tersedia Kanal B" value={`${totalUnit} Unit`} subtitle="Produk 3 & Produk 4" icon={Package} tone="sage" />
        <StatCard title="Total Penjualan Online B" value={formatRupiah(totalOmzet)} subtitle={`${sales.total} pesanan tercatat`} icon={ShoppingCart} tone="blue" />
      </div>
    </div>
  );
}
