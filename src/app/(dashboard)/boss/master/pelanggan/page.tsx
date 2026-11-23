import { queryCustomers } from "@/server/queries/erp.queries";
import { CustomerView } from "@/features/erp-views/InteractiveModules";
export default async function BossCustomersPage() {
  const res = await queryCustomers();
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Data Master Pelanggan</h1><CustomerView initialItems={res.items} total={res.total} /></div>);
}
