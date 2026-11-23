import { queryProfitReport } from "@/server/queries/erp.queries";
import { ProfitReportView } from "@/features/erp-views/InteractiveModules";
export default async function BossReportPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const sp = await searchParams;
  const period = (sp.period === "DAILY" || sp.period === "WEEKLY" ? sp.period : "MONTHLY") as "DAILY" | "WEEKLY" | "MONTHLY";
  const rows = await queryProfitReport(period);
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Laporan Profit Manajemen (Non-HPP)</h1><ProfitReportView rows={rows} period={period} /></div>);
}
