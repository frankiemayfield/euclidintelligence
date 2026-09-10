import { useNavigate } from "react-router-dom";
import { ScheduleModule } from "./ScheduleModule";
import { CompanyScheduleView } from "./CompanyScheduleView";
import { Dropdown } from "@/components/app/active/Dropdown";
import { getProject, projects } from "@/data/demoUniverse";
import { scheduleHealth, statusFor } from "@/data/scheduleData";
import { cn } from "@/lib/utils";

export const ALL_ACTIVE = "all-active";
export const ALL_PROJECTS = "all";

export type ScheduleScope =
  | { kind: "company"; mode: typeof ALL_ACTIVE | typeof ALL_PROJECTS }
  | { kind: "project"; projectId: string };

/**
 * The single Schedule tool. Company scope aggregates the very same project schedule
 * activities into a coordination calendar; project scope reveals the full scheduling
 * engine. Both routes (`/operations/schedule` and `/projects/:id/schedule`) render this.
 */
export function ScheduleWorkspace({ scope, base, scopeCompanyId }: {
  scope: ScheduleScope;
  base: string;
  scopeCompanyId?: string;
}) {
  const navigate = useNavigate();

  const scheduled = projects.filter(p => statusFor(p.id).mode !== "none");
  const activeIds = scheduled.filter(p => statusFor(p.id).mode === "active").map(p => p.id);
  const allIds = scheduled.map(p => p.id);

  const isCompany = scope.kind === "company";
  const current = isCompany ? scope.mode : scope.projectId;
  const label = !isCompany
    ? getProject(scope.projectId).name
    : scope.mode === ALL_PROJECTS ? "All Projects" : "All Active Projects";

  // Scope switching is real routing, so back / forward / refresh / deep links all work.
  const goCompany = (mode: string) =>
    navigate(`${base}/operations/schedule${mode === ALL_PROJECTS ? "?scope=all" : ""}`);
  const goProject = (id: string) => navigate(`${base}/projects/${id}/schedule`);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex flex-wrap items-center justify-end gap-3">
        <Dropdown label={label} width="w-72">
          {[[ALL_ACTIVE, "All Active Projects"], [ALL_PROJECTS, "All Projects"]].map(([id, l]) => (
            <button key={id} onClick={() => goCompany(id)}
              className={cn("w-full rounded-lg px-2 py-1.5 text-left font-semibold hover:bg-card/70", current === id && "text-primary")}>{l}</button>
          ))}
          <div className="my-1 h-px bg-border/60" />
          {scheduled.map(p => (
            <button key={p.id} onClick={() => goProject(p.id)}
              className={cn("flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-card/70", current === p.id && "text-primary")}>
              <span className="truncate">{p.name}</span>
              <span className="shrink-0 text-[9px] text-muted-foreground">{scheduleHealth(p.id).state}</span>
            </button>
          ))}
        </Dropdown>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {isCompany
          ? <CompanyScheduleView projectIds={scope.mode === ALL_PROJECTS ? allIds : activeIds} scopeCompanyId={scopeCompanyId} base={base} />
          : <ScheduleModule projectId={scope.projectId} projectName={getProject(scope.projectId).name} scopeCompanyId={scopeCompanyId} />}
      </div>
    </div>
  );
}
