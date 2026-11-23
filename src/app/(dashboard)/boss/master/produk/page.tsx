import { queryProducts } from "@/server/queries/erp.queries";
import { ProductMasterView } from "@/features/erp-views/InteractiveModules";
export default async function BossProductsPage() {
  const res = await queryProducts();
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Data Master Produk Jadi</h1><ProductMasterView initialItems={res.items} total={res.total} canEdit={true} /></div>);
}
