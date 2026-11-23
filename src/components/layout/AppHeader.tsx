"use client";

import { signOut } from "next-auth/react";
import { LogOut, Bell, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserRole } from "@/types/dto";

export function AppHeader({ userName, role }: { userName: string; role: UserRole }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#E5E7EB] bg-white px-6">
      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        <span>Priangan Sentosa ERP</span>
        <span>/</span>
        <Badge variant="outline" className="bg-[#E8EEF8] text-[#526D9B] border-none">Mode: Fase 1 (Mock Server)</Badge>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-[#6B7280]" aria-label="Notifikasi">
          <Bell className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 border-[#E5E7EB]">
              <UserCircle className="h-4 w-4 text-[#526D9B]" />
              <span className="text-sm font-medium text-[#1F2937]">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-[#6B7280]">{role}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="text-[#BB6D70] cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Keluar (Logout)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
