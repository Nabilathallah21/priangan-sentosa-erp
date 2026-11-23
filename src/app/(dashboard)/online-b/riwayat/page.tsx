import { querySales, queryProducts } from "@/server/queries/erp.queries";
import { SalesEntryAndListView } from "@/features/erp-views/InteractiveModules";
export default async function OnlineBRiwayatPage() {
  const [s, p] = await Promise.all([querySales({ channel: "ONLINE_B" }), queryProducts()]);
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Riwayat &amp; Status Pesanan Online B</h1><SalesEntryAndListView channel="ONLINE_B" sales={s.items} products={p.items} allowPriceOverride={false} showForm={false} /></div>);
}
