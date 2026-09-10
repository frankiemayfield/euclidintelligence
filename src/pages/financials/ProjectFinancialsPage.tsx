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

const TABS = ["budget", "costs", "commitments", "changes", "billing"] as const;
type Tab = (typeof TABS)[number];
const LABELS: Record<Tab, string> = { budget: "Budget", costs: "Costs", commitments: "Commitments", changes: "Change Orders", billing: "Client Billing" };

export default function ProjectFinancialsPage() {
  const { projectId = "downtown-ti", tab } = useParams();
  const track = useTrack();
  const navigate = useNavigate();
  const base = track === "sub" ? "/sub" : "/app";
  const id = financialProjectIds.includes(projectId) ? projectId : financialProjectIds[0];
  const project = getProject(id);
  const f = projectFinancials(id);
  const active: Tab = (TABS.includes(tab as Tab) ? tab : "budget") as Tab;
  useEffect(() => { recordRecentProject("financials", id, active); }, [id, active]);

  return (
    <TrackShell>
      <div className="mx-auto w-full max-w-[1250px] p-4 lg:p-7">
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

        <ToolTabs items={TABS.map(t => ({ id: t, label: LABELS[t] }))} active={active} onSelect={t => navigate(`${base}/financials/${id}/${t}`)} />

        {active === "budget" && <BudgetTab projectId={id} base={base} />}
        {active === "costs" && <CostsTab projectId={id} />}
        {active === "commitments" && <CommitmentsTab projectId={id} />}
        {active === "changes" && <ChangesTab projectId={id} />}
        {active === "billing" && <ClientBillingTab projectId={id} />}
      </div>
    </TrackShell>
  );
}
