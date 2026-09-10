import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { money } from "@/data/demoUniverse";
import { formulaHelp } from "@/data/financialData";

export function Metric({ label, value, tone, hint, sub }: {
  label: string; value: string | number; tone?: "default" | "good" | "bad" | "muted"; hint?: string; sub?: string;
}) {
  const text = typeof value === "number" ? money(value) : value;
  return (
    <div className="odyssey-surface rounded-xl p-3" title={hint ?? formulaHelp[label]}>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-display text-[17px] font-bold leading-tight",
        tone === "good" && "text-success", tone === "bad" && "text-warning", tone === "muted" && "text-muted-foreground")}>{text}</p>
      {sub && <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("odyssey-surface rounded-2xl p-4", className)}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-sm font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Pill({ label, tone = "muted" }: { label: string; tone?: "muted" | "good" | "bad" | "info" }) {
  return (
    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
      tone === "good" && "bg-success/15 text-success",
      tone === "bad" && "bg-warning/15 text-warning",
      tone === "info" && "bg-primary/10 text-primary",
      tone === "muted" && "bg-secondary/80 text-muted-foreground")}>{label}</span>
  );
}

export function Filters({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)}
          className={cn("rounded-full px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground",
            value === o && "bg-primary/10 text-primary")}>{o}</button>
      ))}
    </div>
  );
}

export function Variance({ value }: { value: number }) {
  return <span className={cn("font-semibold", value < 0 ? "text-warning" : "text-success")}>{value < 0 ? `-${money(Math.abs(value))}` : `+${money(value)}`}</span>;
}

export function DeepLink({ to, children }: { to: string; children: React.ReactNode }) {
  return <Link to={to} className="text-[11px] font-semibold text-primary hover:underline">{children}</Link>;
}
