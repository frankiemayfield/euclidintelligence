import { useState } from "react";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { ScheduleModule } from "@/components/app/schedule/ScheduleModule";
import { CompanyScheduleView } from "@/components/app/schedule/CompanyScheduleView";
import { Dropdown } from "@/components/app/active/Dropdown";
import { getProject, projects } from "@/data/demoUniverse";
import { scheduleHealth, statusFor } from "@/data/scheduleData";
import { cn } from "@/lib/utils";

const ALL = "all";
const ALL_ACTIVE = "all-active";

export default function SchedulePage() {
  const track = useTrack();
  const base = track === "sub" ? "/sub" : "/app";
  const scopeCompanyId = track === "sub" ? "trueframe" : undefined;

  const scheduled = projects.filter(p => statusFor(p.id).mode !== "none");
  const activeIds = scheduled.filter(p => statusFor(p.id).mode === "active").map(p => p.id);
  const allIds = scheduled.map(p => p.id);

  const [scope, setScope] = useState<string>(ALL_ACTIVE);
  const isCompany = scope === ALL || scope === ALL_ACTIVE;
  const label = scope === ALL ? "All Projects" : scope === ALL_ACTIVE ? "All Active Projects" : getProject(scope).name;
  const companyIds = scope === ALL ? allIds : activeIds;

  return (
    <TrackShell>
      <div className="mx-auto flex h-full w-full max-w-[1250px] flex-col p-4 lg:p-6">
        <header className="mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-muted-foreground">Operations</p>
          <h1 className="font-display text-2xl font-semibold">Schedule</h1>
        </header>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <Dropdown label={label} width="w-72">
            {[[ALL_ACTIVE, "All Active Projects"], [ALL, "All Projects"]].map(([id, l]) => (
              <button key={id} onClick={() => setScope(id)}
                className={cn("w-full rounded-lg px-2 py-1.5 text-left font-semibold hover:bg-card/70", scope === id && "text-primary")}>{l}</button>
            ))}
            <div className="my-1 h-px bg-border/60" />
            {scheduled.map(p => (
              <button key={p.id} onClick={() => setScope(p.id)}
                className={cn("flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-card/70", scope === p.id && "text-primary")}>
                <span className="truncate">{p.name}</span>
                <span className="shrink-0 text-[9px] text-muted-foreground">{scheduleHealth(p.id).state}</span>
              </button>
            ))}
          </Dropdown>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          {isCompany
            ? <CompanyScheduleView projectIds={companyIds} scopeCompanyId={scopeCompanyId} base={base} />
            : <ScheduleModule projectId={scope} projectName={getProject(scope).name} scopeCompanyId={scopeCompanyId} />}
        </div>
      </div>
    </TrackShell>
  );
}
