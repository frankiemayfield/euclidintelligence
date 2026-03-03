import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlanReferenceChip({ sheet, className }: { sheet: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium text-info bg-info/5 border border-info/20 rounded px-1.5 py-0.5", className)}>
      <FileText size={9} />
      {sheet}
    </span>
  );
}
