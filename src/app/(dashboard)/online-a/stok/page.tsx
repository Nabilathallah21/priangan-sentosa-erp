import { queryStockBalances, queryInventoryMovements, queryProducts } from "@/server/queries/erp.queries";
import { StockAndTransferView } from "@/features/erp-views/InteractiveModules";
export default async function OnlineAStockPage() {
  const [b, m, p] = await Promise.all([queryStockBalances(), queryInventoryMovements(), queryProducts()]);
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Stok Kanal Online A (Produk 1 &amp; 2)</h1><StockAndTransferView balances={b.items} movements={m.items} transfers={[]} products={p.items} canTransfer={false} /></div>);
}
