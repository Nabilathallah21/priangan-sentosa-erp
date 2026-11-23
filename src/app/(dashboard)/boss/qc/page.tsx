import { queryQcInspections, queryProductions, queryQcDefectCategories } from "@/server/queries/erp.queries";
import { QcInspectionView } from "@/features/erp-views/InteractiveModules";
export default async function BossQcPage() {
  const [qc, pending, cats] = await Promise.all([queryQcInspections(), queryProductions({ qcCompleted: false }), queryQcDefectCategories()]);
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Quality Control (OK vs NG)</h1><QcInspectionView inspections={qc.items} pendingProductions={pending.items} defectCategories={cats} canApprove={true} /></div>);
}
