import { AlertTriangle, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type ImpactTone = "neutral" | "warning" | "positive";
export type ImpactDomain = "Schedule" | "Labor" | "Cost" | "Compliance";

const toneClass: Record<ImpactTone, string> = {
  neutral: "border-primary/35 bg-primary/5",
  warning: "border-warning/40 bg-warning/10",
  positive: "border-success/40 bg-success/10",
};
const labelClass: Record<ImpactTone, string> = {
  neutral: "text-primary",
  warning: "text-warning",
  positive: "text-success",
};

/** Signature Euclid intelligence surface, shared across Schedule, Time Clock, Costs and Compliance. */
export function EuclidImpact({ domain = "Schedule", tone = "neutral", headline, message, action, className }: {
  domain?: ImpactDomain; tone?: ImpactTone; headline?: string; message: string;
  action?: { label: string; to: string }; className?: string;
}) {
  const Icon = tone === "warning" ? AlertTriangle : tone === "positive" ? TrendingUp : Sparkles;
  return (
    <div className={cn("rounded-xl border p-3", toneClass[tone], className)}>
      <p className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide", labelClass[tone])}>
        <Icon size={11} />Euclid impact · {domain}
      </p>
      {headline && <p className="mt-1 text-[12px] font-semibold">{headline}</p>}
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{message}</p>
      {action && (
        <Link to={action.to} className={cn("mt-2 inline-flex items-center gap-1 text-[11px] font-semibold hover:underline", labelClass[tone])}>
          {action.label}<ArrowRight size={11} />
        </Link>
      )}
    </div>
  );
}
