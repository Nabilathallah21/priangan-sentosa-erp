import { queryAuditLogs } from "@/server/queries/erp.queries";
import { AuditLogView } from "@/features/erp-views/InteractiveModules";
export default async function BossAuditLogPage() {
  const res = await queryAuditLogs();
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Audit Log Aktivitas Sistem</h1><AuditLogView logs={res.items} /></div>);
}
