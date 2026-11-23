import { queryUsers } from "@/server/queries/erp.queries";
import { UserListView } from "@/features/erp-views/InteractiveModules";
export default async function BossUsersPage() {
  const res = await queryUsers();
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Data Pengguna &amp; Hak Akses</h1><UserListView users={res.items} /></div>);
}
