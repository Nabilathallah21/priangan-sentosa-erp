import { queryMonthlySalaries } from "@/server/queries/erp.queries";
import { SalaryExpenseView } from "@/features/erp-views/InteractiveModules";
export default async function BossExpensesPage() {
  const salaries = await queryMonthlySalaries();
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Pengeluaran Gaji Karyawan Bulanan</h1><SalaryExpenseView salaries={salaries} /></div>);
}
