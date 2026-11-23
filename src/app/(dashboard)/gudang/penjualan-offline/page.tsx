import { querySales, queryProducts, queryCustomers } from "@/server/queries/erp.queries";
import { SalesEntryAndListView } from "@/features/erp-views/InteractiveModules";
export default async function GudangOfflineSalePage() {
  const [s, p, c] = await Promise.all([querySales({ channel: "OFFLINE" }), queryProducts(), queryCustomers()]);
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Transaksi Penjualan Offline</h1><SalesEntryAndListView channel="OFFLINE" sales={s.items} products={p.items} customers={c.items} allowPriceOverride={true} showForm={true} /></div>);
}
