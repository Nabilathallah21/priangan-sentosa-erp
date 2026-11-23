import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Priangan Sentosa ERP",
  description: "Sistem ERP Manufaktur, Pergudangan, Distribusi, dan Penjualan PT Priangan Sentosa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased bg-[#F7F8FA] text-[#1F2937]`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
