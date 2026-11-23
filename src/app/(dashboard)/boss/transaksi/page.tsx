import { querySales, queryProducts, queryCustomers } from "@/server/queries/erp.queries";
import { SalesEntryAndListView } from "@/features/erp-views/InteractiveModules";
export default async function BossAllSalesPage() {
  const [s, p, c] = await Promise.all([querySales(), queryProducts(), queryCustomers()]);
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Semua Transaksi Penjualan (Offline &amp; Online)</h1><SalesEntryAndListView channel="OFFLINE" sales={s.items} products={p.items} customers={c.items} allowPriceOverride={true} showForm={false} /></div>);
}
