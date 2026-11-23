import { AlertCircle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title = "Belum ada data",
  description = "Data untuk tampilan ini belum tersedia.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-white p-10 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8EEF8] text-[#526D9B]">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-[#1F2937]">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-[#6B7280]">{description}</p>
    </div>
  );
}

export function ErrorState({
  message = "Gagal memuat data dari server.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-[#F4DFDF] bg-[#F4DFDF]/30 p-8 text-center">
      <AlertCircle className="h-6 w-6 text-[#BB6D70]" />
      <p className="mt-2 text-sm font-semibold text-[#1F2937]">Terjadi Kesalahan</p>
      <p className="mt-1 text-xs text-[#6B7280]">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
          Coba Lagi
        </Button>
      )}
    </div>
  );
}