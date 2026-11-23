import { querySuppliers } from "@/server/queries/erp.queries";
import { SupplierView } from "@/features/erp-views/InteractiveModules";
export default async function BossSuppliersPage() {
  const res = await querySuppliers();
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Data Master Supplier</h1><SupplierView initialItems={res.items} total={res.total} /></div>);
}
