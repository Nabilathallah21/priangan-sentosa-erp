import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatTanggal(isoString: string, pattern = "dd MMM yyyy"): string {
  return format(parseISO(isoString), pattern, { locale: localeId });
}

export function formatTanggalWaktu(isoString: string): string {
  return format(parseISO(isoString), "dd MMM yyyy, HH:mm", { locale: localeId });
}