import { useState } from "react";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { ScheduleModule } from "@/components/app/schedule/ScheduleModule";
import { Dropdown } from "@/components/app/active/Dropdown";
import { OperationsNav } from "@/components/app/OperationsNav";
import { getProject, projects } from "@/data/demoUniverse";
import { scheduleHealth, statusFor } from "@/data/scheduleData";
import { cn } from "@/lib/utils";

const ALL = "all";

export default function SchedulePage() {
  const track = useTrack();
  const list = projects
    .filter(p => statusFor(p.id).mode !== "none")
    .sort((a, b) => (statusFor(a.id).mode === "active" ? -1 : 1) - (statusFor(b.id).mode === "active" ? -1 : 1));
  const [projectId, setProjectId] = useState<string>(ALL);
  const scopeCompanyId = track === "sub" ? "trueframe" : undefined;
  const selectedLabel = projectId === ALL ? "All Active Projects" : getProject(projectId).name;
  const shown = projectId === ALL ? list : list.filter(p => p.id === projectId);

  return (
    <TrackShell>
      <div className="flex h-full w-full flex-col p-4 lg:p-6">
        <header className="mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-muted-foreground">Operations</p>
          <h1 className="font-display text-2xl font-semibold">Schedule</h1>
        </header>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <OperationsNav base={track === "sub" ? "/sub" : "/app"} active="schedule" />
          <Dropdown label={selectedLabel} width="w-72">
            <button onClick={() => setProjectId(ALL)} className={cn("w-full rounded-lg px-2 py-1.5 text-left hover:bg-card/70", projectId === ALL && "text-primary")}>All Active Projects</button>
            {list.map(p => (
              <button key={p.id} onClick={() => setProjectId(p.id)}
                className={cn("flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-card/70", projectId === p.id && "text-primary")}>
                <span className="truncate">{p.name}</span>
                <span className="shrink-0 text-[9px] text-muted-foreground">{scheduleHealth(p.id).state}</span>
              </button>
            ))}
          </Dropdown>
        </div>
        <div className={cn("flex min-h-0 flex-1 flex-col gap-6", projectId === ALL && "overflow-auto")}>
          {shown.map(p => (
            <div key={p.id} className="flex min-h-0 flex-1 flex-col">
              {projectId === ALL && <p className="mb-2 font-display text-sm font-semibold">{p.name}</p>}
              <ScheduleModule projectId={p.id} projectName={p.name} scopeCompanyId={scopeCompanyId} />
            </div>
          ))}
        </div>
      </div>
    </TrackShell>
  );
}
