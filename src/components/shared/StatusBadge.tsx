import { Badge } from "@/components/ui/badge";
import { DocumentStatus } from "@/types/dto";

const STATUS_MAP: Record<DocumentStatus, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-[#F5E7D4] text-[#C28B50] hover:bg-[#F5E7D4]" },
  POSTED: { label: "Posted", className: "bg-[#DDEBE3] text-[#638773] hover:bg-[#DDEBE3]" },
  CANCELLED: { label: "Dibatalkan", className: "bg-[#F4DFDF] text-[#BB6D70] hover:bg-[#F4DFDF]" },
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const cfg = STATUS_MAP[status];
  return <Badge className={`border-none font-medium ${cfg.className}`}>{cfg.label}</Badge>;
}