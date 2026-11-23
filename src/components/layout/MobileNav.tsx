"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu, X, Factory, LayoutDashboard, Package, Boxes, Truck, Users,
  AlertTriangle, ClipboardCheck, ShieldCheck, ArrowDownToLine,
  CheckCircle2, Warehouse, ShoppingCart, Wallet, Receipt, BarChart3,
  History, ArrowLeftRight, ShoppingBag, Circle, type LucideIcon
} from "lucide-react";
import { ROLE_NAVIGATION } from "@/config/navigation";
import { UserRole } from "@/types/dto";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Package, Boxes, Truck, Users, AlertTriangle,
  ClipboardCheck, ShieldCheck, ArrowDownToLine, Factory, CheckCircle2,
  Warehouse, ShoppingCart, Wallet, Receipt, BarChart3, History,
  ArrowLeftRight, ShoppingBag,
};

export function MobileNav({ role, userName }: { role: UserRole; userName: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = ROLE_NAVIGATION[role] ?? [];

  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    acc[item.section] = acc[item.section] ?? [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka menu navigasi"
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#1F2937] hover:bg-[#F7F8FA]"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-[#E5E7EB] px-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8EEF8] text-[#526D9B]">
                  <Factory className="h-5 w-5" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-bold text-[#1F2937]">PT Priangan Sentosa</p>
                  <p className="text-[11px] text-[#6B7280]">ERP Mobile</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F7F8FA]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
              {Object.entries(grouped).map(([section, navItems]) => (
                <div key={section} className="space-y-1">
                  <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    {section}
                  </p>
                  {navItems.map((item) => {
                    const IconComponent = ICON_MAP[item.icon] ?? Circle;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-[#E8EEF8] text-[#526D9B]"
                            : "text-[#1F2937] hover:bg-[#F7F8FA]"
                        )}
                      >
                        <IconComponent
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-[#526D9B]" : "text-[#6B7280]"
                          )}
                        />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="border-t border-[#E5E7EB] p-4">
              <div className="rounded-lg bg-[#F7F8FA] p-2.5">
                <p className="text-xs font-semibold text-[#1F2937] truncate">{userName}</p>
                <p className="text-[11px] font-mono text-[#526D9B]">{role}</p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}