import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AccentTone = "blue" | "sage" | "amber" | "lavender" | "rose";

const TONE_CLASSES: Record<AccentTone, { bg: string; text: string }> = {
  blue: { bg: "bg-[#E8EEF8]", text: "text-[#526D9B]" },
  sage: { bg: "bg-[#DDEBE3]", text: "text-[#638773]" },
  amber: { bg: "bg-[#F5E7D4]", text: "text-[#C28B50]" },
  lavender: { bg: "bg-[#E9E2F3]", text: "text-[#8973AA]" },
  rose: { bg: "bg-[#F4DFDF]", text: "text-[#BB6D70]" },
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  tone?: AccentTone;
}

export function StatCard({ title, value, subtitle, icon: Icon, tone = "blue" }: StatCardProps) {
  const colors = TONE_CLASSES[tone];
  return (
    <Card className="border-[#E5E7EB] bg-white shadow-none">
      <CardContent className="p-5 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#6B7280]">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-[#1F2937]">{value}</p>
          {subtitle && <p className="text-xs text-[#6B7280]">{subtitle}</p>}
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", colors.bg, colors.text)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}