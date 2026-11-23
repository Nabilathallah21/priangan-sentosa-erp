import { queryProductions, queryProducts, queryMaterials } from "@/server/queries/erp.queries";
import { ProductionView } from "@/features/erp-views/InteractiveModules";
export default async function BossProductionPage() {
  const [pr, p, m] = await Promise.all([queryProductions(), queryProducts(), queryMaterials()]);
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Produksi &amp; Pemakaian Bahan</h1><ProductionView productions={pr.items} products={p.items} materials={m.items} /></div>);
}
