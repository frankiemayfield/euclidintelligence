import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface Assumption {
  label: string;
  value: string;
}

export function AssumptionsDrawer({ assumptions, title = "Assumptions" }: { assumptions: Assumption[]; title?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        {title} ({assumptions.length})
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="p-3 space-y-1.5 text-xs">
          {assumptions.map((a) => (
            <div key={a.label} className="flex justify-between gap-2">
              <span className="text-muted-foreground">{a.label}</span>
              <span className="text-foreground text-right">{a.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
