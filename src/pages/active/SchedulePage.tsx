import { useState } from "react";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { ScheduleModule } from "@/components/app/schedule/ScheduleModule";
import { getProject, projects } from "@/data/demoUniverse";
import { statusFor } from "@/data/scheduleData";
import { cn } from "@/lib/utils";

export default function SchedulePage() {
  const track = useTrack();
  const list = projects.filter(p => statusFor(p.id).mode !== "none");
  const [projectId, setProjectId] = useState(list[0]?.id ?? "downtown-ti");
  const project = getProject(projectId);

  return (
    <TrackShell>
      <div className="flex h-full w-full flex-col p-4 lg:p-6">
        <header className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-muted-foreground">Construction operations</p>
            <h1 className="font-display text-2xl font-semibold">Schedule</h1>
          </div>
          <div className="flex gap-1">
            {list.map(p => (
              <button key={p.id} onClick={() => setProjectId(p.id)}
                className={cn("rounded-full border px-3 py-1.5 text-[11px] font-semibold", projectId === p.id ? "border-primary/50 bg-primary/10 text-primary" : "border-border/60 text-muted-foreground")}>
                {p.name}
              </button>
            ))}
          </div>
        </header>
        <ScheduleModule projectId={projectId} projectName={project.name} scopeCompanyId={track === "sub" ? "trueframe" : undefined} />
      </div>
    </TrackShell>
  );
}
