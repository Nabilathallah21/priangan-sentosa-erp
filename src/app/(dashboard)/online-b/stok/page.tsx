import { queryStockBalances, queryInventoryMovements, queryProducts } from "@/server/queries/erp.queries";
import { StockAndTransferView } from "@/features/erp-views/InteractiveModules";
export default async function OnlineBStockPage() {
  const [b, m, p] = await Promise.all([queryStockBalances(), queryInventoryMovements(), queryProducts()]);
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Stok Kanal Online B (Produk 3 &amp; 4)</h1><StockAndTransferView balances={b.items} movements={m.items} transfers={[]} products={p.items} canTransfer={false} /></div>);
}
