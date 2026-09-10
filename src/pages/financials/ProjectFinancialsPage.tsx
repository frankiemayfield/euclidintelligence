import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { getProject, money } from "@/data/demoUniverse";
import { financialProjectIds, projectFinancials } from "@/data/financialData";
import { BudgetTab } from "@/components/app/financials/BudgetTab";
import { CostsTab } from "@/components/app/financials/CostsTab";
import { CommitmentsTab } from "@/components/app/financials/CommitmentsTab";
import { ChangesTab } from "@/components/app/financials/ChangesTab";
import { ClientBillingTab } from "@/components/app/financials/ClientBillingTab";
import { Pill } from "@/components/app/financials/FinancialPrimitives";
import { ProjectHeader, ToolTabs } from "@/components/app/ProjectHeader";
import { cn } from "@/lib/utils";
import { recordRecentProject } from "@/lib/projectContext";
import { FINANCIAL_TOOL_SLUGS, financialSlugForTab, projectFinancialTool } from "@/lib/routes";

const TABS = ["budget", "costs", "commitments", "changes", "billing"] as const;
type Tab = (typeof TABS)[number];
const LABELS: Record<Tab, string> = { budget: "Budget", costs: "Costs", commitments: "Commitments", changes: "Change Orders", billing: "Client Billing" };

export default function ProjectFinancialsPage() {
  const { projectId = "downtown-ti", tab } = useParams();
  const track = useTrack();
  const navigate = useNavigate();
  const base = track === "sub" ? "/sub" : "/app";
  const gated = !financialProjectIds.includes(projectId);
  const id = gated ? financialProjectIds[0] : projectId;
  const requested = getProject(projectId);
  const project = getProject(id);
  const f = projectFinancials(id);
  const active: Tab = ((tab && FINANCIAL_TOOL_SLUGS[tab]) ?? "budget") as Tab;
  useEffect(() => { if (!gated) recordRecentProject("financials", id, active); }, [gated, id, active]);

  if (gated) {
    return (
      <TrackShell>
        <div className="app-shell pb-4 pt-1 lg:pb-7 lg:pt-2">
          <div className="odyssey-surface rounded-2xl p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-muted-foreground">Financials unavailable</p>
            <h1 className="mt-1 font-display text-xl font-semibold tracking-tight">{requested.name}</h1>
            <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-muted-foreground">
              This job is still in preconstruction ({requested.builderStatus}). Job costing opens once the proposal is
              accepted, the estimate is finalized, and the estimate is pushed to the job-costing budget.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-[12px] font-semibold">
              <Link to={`${base}/projects/${requested.id}/preconstruction`} className="text-primary">Open Preconstruction →</Link>
              <Link to={`${base}/financials/overview`} className="text-primary">Financials Overview →</Link>
            </div>
          </div>
        </div>
      </TrackShell>
    );
  }

  return (
    <TrackShell>
      <div className="app-shell pb-4 pt-1 lg:pb-7 lg:pt-2">
        <ProjectHeader
          projectId={id}
          pillar="financials"
          tool={active}
          section="financials"
          subtitle={`${project.client} · ${project.location} · contract ${money(f.currentContract)}`}
          meta={
            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <div><p className="text-muted-foreground">Forecast margin</p><p className="font-semibold">{f.forecastMargin.toFixed(1)}%</p></div>
              <div><p className="text-muted-foreground">Projected variance</p><p className={cn("font-semibold", f.variance < 0 ? "text-warning" : "text-success")}>{f.variance < 0 ? "-" : "+"}{money(Math.abs(f.variance))}</p></div>
              <Pill label={f.status} tone={f.status === "At Risk" ? "bad" : f.status === "Watch" ? "info" : "good"} />
            </div>
          }
        />

        <ToolTabs items={TABS.map(t => ({ id: t, label: LABELS[t] }))} active={active} onSelect={t => navigate(projectFinancialTool(base, id, financialSlugForTab[t]))} />

        {active === "budget" && <BudgetTab projectId={id} base={base} />}
        {active === "costs" && <CostsTab projectId={id} />}
        {active === "commitments" && <CommitmentsTab projectId={id} />}
        {active === "changes" && <ChangesTab projectId={id} />}
        {active === "billing" && <ClientBillingTab projectId={id} />}
      </div>
    </TrackShell>
  );
}
