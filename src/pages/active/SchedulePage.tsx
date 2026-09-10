import { useSearchParams } from "react-router-dom";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { ALL_ACTIVE, ALL_PROJECTS, ScheduleWorkspace } from "@/components/app/schedule/ScheduleWorkspace";

/** Operations entry point into the one shared Schedule tool (company scope by default). */
export default function SchedulePage() {
  const track = useTrack();
  const base = track === "sub" ? "/sub" : "/app";
  const scopeCompanyId = track === "sub" ? "trueframe" : undefined;
  const [params] = useSearchParams();
  const mode = params.get("scope") === "all" ? ALL_PROJECTS : ALL_ACTIVE;

  return (
    <TrackShell>
      <div className="app-shell flex h-full flex-col py-4 lg:py-6">
        <header className="mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-muted-foreground">Operations</p>
          <h1 className="font-display text-2xl font-semibold">Schedule</h1>
        </header>
        <ScheduleWorkspace scope={{ kind: "company", mode }} base={base} scopeCompanyId={scopeCompanyId} />
      </div>
    </TrackShell>
  );
}
