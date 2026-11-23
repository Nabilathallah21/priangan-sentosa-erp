"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Factory, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DEMO_ACCOUNTS = [
  { role: "Boss (Manajemen)", user: "boss" },
  { role: "Admin Gudang & Pabrik", user: "gudang" },
  { role: "Admin Online A (Produk 1–2)", user: "onlinea" },
  { role: "Admin Online B (Produk 3–4)", user: "onlineb" },
];

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Username/email atau password salah, atau akun tidak aktif.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] p-4">
      <div className="w-full max-w-md space-y-4">
        <Card className="border-[#E5E7EB] shadow-sm">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8EEF8] text-[#526D9B]">
              <Factory className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-semibold text-[#1F2937]">
              Priangan Sentosa ERP
            </CardTitle>
            <CardDescription className="text-[#6B7280]">
              PT Priangan Sentosa — Sistem Manufaktur, Gudang & Distribusi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-[#F4DFDF] px-3 py-2 text-sm text-[#BB6D70] font-medium">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="identifier">Username atau Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
                  <Input
                    id="identifier"
                    placeholder="Contoh: boss atau gudang"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#526D9B] hover:bg-[#435b84] text-white"
              >
                {loading ? "Memverifikasi..." : "Masuk ke Sistem"}
              </Button>
            </form>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
}