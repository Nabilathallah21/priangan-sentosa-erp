import { queryProductions, queryProducts, queryMaterials } from "@/server/queries/erp.queries";
import { ProductionView } from "@/features/erp-views/InteractiveModules";
export default async function GudangProduksiPage() {
  const [pr, p, m] = await Promise.all([queryProductions(), queryProducts(), queryMaterials()]);
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Barang Keluar &amp; Pencatatan Produksi</h1><ProductionView productions={pr.items} products={p.items} materials={m.items} /></div>);
}
