import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getContainer } from "@/server/container";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    requirePermission(session?.user?.role, "reports", "export");

    const period = (req.nextUrl.searchParams.get("period") ?? "MONTHLY") as "DAILY" | "WEEKLY" | "MONTHLY";
    const format = req.nextUrl.searchParams.get("format") ?? "csv";

    const rows = await getContainer().erpService.getProfitReport(period);

    if (format === "pdf") {
      const html = `<!DOCTYPE html>
<html lang="id">
<head><meta charset="utf-8"><title>Laporan Profit PT Priangan Sentosa</title>
<style>
  body { font-family: Arial, sans-serif; padding: 24px; color: #1F2937; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  p { font-size: 12px; color: #6B7280; margin-top: 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
  th, td { border: 1px solid #E5E7EB; padding: 8px; text-align: right; }
  th:first-child, td:first-child { text-align: left; }
  th { background: #E8EEF8; color: #526D9B; }
</style>
</head>
<body onload="window.print()">
  <h1>PT Priangan Sentosa — Laporan Profit (${period})</h1>
  <p>Dicetak oleh: ${session?.user?.name} | Rumus: Penjualan - Pembayaran Bahan Mentah - Gaji Bulanan</p>
  <table>
    <thead><tr><th>Periode</th><th>Total Penjualan (Rp)</th><th>Pembayaran Bahan (Rp)</th><th>Gaji Bulanan (Rp)</th><th>Profit Bersih (Rp)</th></tr></thead>
    <tbody>
      ${rows.map((r) => `<tr><td>${r.periodLabel}</td><td>${r.totalSales.toLocaleString("id-ID")}</td><td>${r.rawMaterialPayments.toLocaleString("id-ID")}</td><td>${r.salaryExpense.toLocaleString("id-ID")}</td><td><strong>${r.netProfit.toLocaleString("id-ID")}</strong></td></tr>`).join("")}
    </tbody>
  </table>
</body></html>`;
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const csvLines = [
      "Periode,Total Penjualan (Rp),Pembayaran Bahan Mentah (Rp),Gaji Karyawan (Rp),Profit Bersih (Rp)",
      ...rows.map((r) => `${r.periodLabel},${r.totalSales},${r.rawMaterialPayments},${r.salaryExpense},${r.netProfit}`),
    ];

    return new NextResponse(csvLines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="laporan-profit-${period.toLowerCase()}.csv"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Akses export ditolak." },
      { status: 403 }
    );
  }
}
