import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F8FA] p-6 text-center">
      <h1 className="text-3xl font-bold text-[#1F2937]">404 — Halaman Tidak Ditemukan</h1>
      <p className="mt-2 text-sm text-[#6B7280]">
        Halaman yang Anda tuju tidak tersedia atau Anda tidak memiliki akses ke rute tersebut.
      </p>
      <Button asChild className="mt-4 bg-[#526D9B] hover:bg-[#435b84]">
        <Link href="/">Kembali ke Beranda</Link>
      </Button>
    </div>
  );
}
