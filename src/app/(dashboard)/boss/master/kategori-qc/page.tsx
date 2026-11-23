import { queryQcDefectCategories } from "@/server/queries/erp.queries";
import { QcDefectView } from "@/features/erp-views/InteractiveModules";
export default async function BossQcDefectPage() {
  const items = await queryQcDefectCategories();
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Data Master Kategori Cacat QC</h1><QcDefectView items={items} /></div>);
}
