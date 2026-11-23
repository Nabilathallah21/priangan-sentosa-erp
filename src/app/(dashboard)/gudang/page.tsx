import { Warehouse, Package, AlertTriangle, Wallet } from "lucide-react";
import { queryDashboardSummary } from "@/server/queries/erp.queries";
import { StatCard } from "@/components/shared/StatCard";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { formatRupiah } from "@/lib/utils";

export default async function GudangDashboardPage() {
  const s = await queryDashboardSummary();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Dashboard Pabrik &amp; Gudang</h1>
        <p className="text-sm text-[#6B7280]">Kontrol stok bahan, produksi, transfer kanal online, dan penjualan offline.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Bahan Baku & Pelengkap" value={`${s.totalRawMaterialStock + s.totalAuxMaterialStock} Unit`} icon={Warehouse} tone="blue" />
        <StatCard title="Barang Jadi OK (Pusat)" value={`${s.totalFinishedOkStock} Unit`} subtitle={`NG Karantina: ${s.totalFinishedNgStock}`} icon={Package} tone="sage" />
        <StatCard title="Penjualan Offline" value={formatRupiah(s.offlineSalesTotal)} subtitle={`Piutang: ${formatRupiah(s.totalReceivables)}`} icon={Wallet} tone="amber" />
        <StatCard title="Alert Stok Minimum" value={`${s.lowStockCount} Item`} icon={AlertTriangle} tone="rose" />
      </div>
      <SimpleBarChart title="Grafik Barang Masuk vs Barang Keluar" data={s.chartSeries} xKey="label" yKey="keluar" barColor="#638773" />
    </div>
  );
}
