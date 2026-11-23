import { queryMaterialReceipts, querySuppliers, queryMaterials } from "@/server/queries/erp.queries";
import { MaterialReceiptView } from "@/features/erp-views/InteractiveModules";
export default async function GudangBarangMasukPage() {
  const [r, s, m] = await Promise.all([queryMaterialReceipts(), querySuppliers(), queryMaterials()]);
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Riwayat Barang Masuk Gudang</h1><MaterialReceiptView receipts={r.items} suppliers={s.items} materials={m.items} canPost={false} /></div>);
}
