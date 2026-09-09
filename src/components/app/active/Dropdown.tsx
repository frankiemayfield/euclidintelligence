import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

/** Compact Odyssey-style dropdown trigger used across Active Projects toolbars. */
export function Dropdown({ label, icon: Icon, active, children, align = "end", width = "w-60" }: {
  label: string; icon?: React.ElementType; active?: boolean; children: React.ReactNode;
  align?: "start" | "end"; width?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
          active ? "border-primary/50 bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground")}>
          {Icon && <Icon size={12} />}{label}<ChevronDown size={11} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={cn("odyssey-surface z-[90] p-2 text-[11px]", width)}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DropdownToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={e => { e.preventDefault(); onChange(!checked); }}
      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-card/70">
      <span>{label}</span>
      <span className={cn("flex h-4 w-7 items-center rounded-full p-0.5 transition-colors", checked ? "bg-primary" : "bg-muted")}>
        <span className={cn("h-3 w-3 rounded-full bg-background transition-transform", checked && "translate-x-3")} />
      </span>
    </button>
  );
}

export function DropdownSelect({ label, value, options, onChange, render }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void; render?: (v: string) => string;
}) {
  return (
    <label className="flex items-center justify-between gap-2 px-2 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} onClick={e => e.stopPropagation()}
        className="max-w-[58%] rounded-full border border-border/60 bg-transparent px-2 py-1 text-[11px] outline-none">
        {options.map(o => <option key={o} value={o}>{render ? render(o) : o}</option>)}
      </select>
    </label>
  );
}
