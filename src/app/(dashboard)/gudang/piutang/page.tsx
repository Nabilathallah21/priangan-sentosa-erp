import { querySales, queryPayments } from "@/server/queries/erp.queries";
import { ReceivablesAndPaymentView } from "@/features/erp-views/InteractiveModules";
export default async function GudangReceivablesPage() {
  const [rec, pay] = await Promise.all([querySales({ channel: "OFFLINE", onlyReceivables: true }), queryPayments()]);
  return (<div className="space-y-4"><h1 className="text-xl font-bold">Piutang &amp; Pembayaran Pelanggan Offline</h1><ReceivablesAndPaymentView receivables={rec.items} payments={pay.items} /></div>);
}
