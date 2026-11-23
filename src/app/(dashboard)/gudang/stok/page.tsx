import { queryStockBalances, queryInventoryMovements, queryStockTransfers, queryProducts } from "@/server/queries/erp.queries";
import { StockAndTransferView } from "@/features/erp-views/InteractiveModules";
export default async function GudangStockPage() {
  const [b, m, t, p] = await Promise.all([queryStockBalances(), queryInventoryMovements(), queryStockTransfers(), queryProducts()]);
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Stok Gudang &amp; Kartu Stok</h1><StockAndTransferView balances={b.items} movements={m.items} transfers={t.items} products={p.items} canTransfer={false} /></div>);
}
