import { queryMaterials } from "@/server/queries/erp.queries";
import { MaterialMasterView } from "@/features/erp-views/InteractiveModules";
export default async function BossMaterialsPage() {
  const res = await queryMaterials();
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Data Master Bahan Baku &amp; Pelengkap</h1><MaterialMasterView initialItems={res.items} total={res.total} canEdit={true} /></div>);
}
