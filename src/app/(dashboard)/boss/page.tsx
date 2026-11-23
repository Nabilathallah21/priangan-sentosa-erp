import { Package, Warehouse, Wallet, TrendingUp, AlertTriangle, ShoppingBag } from "lucide-react";
import { queryDashboardSummary } from "@/server/queries/erp.queries";
import { StatCard } from "@/components/shared/StatCard";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { formatRupiah } from "@/lib/utils";

export default async function BossDashboardPage() {
  const summary = await queryDashboardSummary();
  const totalSales = summary.offlineSalesTotal + summary.onlineASalesTotal + summary.onlineBSalesTotal;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Dashboard Perusahaan — PT Priangan Sentosa</h1>
        <p className="text-sm text-[#6B7280]">Ringkasan stok pabrik, distribusi kanal online, penjualan, dan piutang.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Penjualan (Semua Kanal)" value={formatRupiah(totalSales)} subtitle="Offline + Online A + Online B" icon={TrendingUp} tone="blue" />
        <StatCard title="Stok Barang Jadi OK" value={`${summary.totalFinishedOkStock} Unit`} subtitle={`NG Karantina: ${summary.totalFinishedNgStock} Unit`} icon={Package} tone="sage" />
        <StatCard title="Total Piutang Berjalan" value={formatRupiah(summary.totalReceivables)} subtitle="Tagihan belum lunas" icon={Wallet} tone="amber" />
        <StatCard title="Stok Bahan Baku & Pelengkap" value={`${summary.totalRawMaterialStock + summary.totalAuxMaterialStock} Unit`} subtitle={`Baku: ${summary.totalRawMaterialStock} | Pelengkap: ${summary.totalAuxMaterialStock}`} icon={Warehouse} tone="lavender" />
        <StatCard title="Stok Kanal Online (A + B)" value={`${summary.totalOnlineAStock + summary.totalOnlineBStock} Unit`} subtitle={`Online A: ${summary.totalOnlineAStock} | Online B: ${summary.totalOnlineBStock}`} icon={ShoppingBag} tone="blue" />
        <StatCard title="Peringatan Stok Minimum" value={`${summary.lowStockCount} Item`} subtitle="Perlu pengadaan / produksi ulang" icon={AlertTriangle} tone="rose" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SimpleBarChart title="Tren Omzet Penjualan Mingguan (Rp)" data={summary.chartSeries} xKey="label" yKey="penjualan" barColor="#526D9B" />
        <SimpleBarChart title="Pergerakan Barang Masuk Gudang" data={summary.chartSeries} xKey="label" yKey="masuk" barColor="#638773" />
      </div>
    </div>
  );
}
