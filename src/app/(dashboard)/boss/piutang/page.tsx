import { querySales, queryPayments } from "@/server/queries/erp.queries";
import { ReceivablesAndPaymentView } from "@/features/erp-views/InteractiveModules";
export default async function BossReceivablesPage() {
  const [rec, pay] = await Promise.all([querySales({ onlyReceivables: true }), queryPayments()]);
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Monitoring Piutang &amp; Riwayat Pembayaran</h1><ReceivablesAndPaymentView receivables={rec.items} payments={pay.items} /></div>);
}
