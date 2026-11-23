import { querySales, queryProducts } from "@/server/queries/erp.queries";
import { SalesEntryAndListView } from "@/features/erp-views/InteractiveModules";
export default async function OnlineATransaksiPage() {
  const [s, p] = await Promise.all([querySales({ channel: "ONLINE_A" }), queryProducts()]);
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Input Transaksi Penjualan Online A</h1><SalesEntryAndListView channel="ONLINE_A" sales={s.items} products={p.items} allowPriceOverride={false} showForm={true} /></div>);
}
