"use client";

import { ErrorState } from "@/components/shared/StateFeedback";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-10">
      <ErrorState
        message={error.message || "Terjadi kesalahan atau akses tidak diizinkan pada halaman ini."}
        onRetry={() => reset()}
      />
    </div>
  );
}
