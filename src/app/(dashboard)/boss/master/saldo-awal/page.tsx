import { queryProducts, queryMaterials, queryStockBalances } from "@/server/queries/erp.queries";
import { OpeningBalanceView } from "@/features/erp-views/InteractiveModules";
export default async function BossOpeningBalancePage() {
  const [p, m, b] = await Promise.all([queryProducts(), queryMaterials(), queryStockBalances()]);
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Dokumen Saldo Awal Stok</h1><OpeningBalanceView products={p.items} materials={m.items} balances={b.items} /></div>);
}
