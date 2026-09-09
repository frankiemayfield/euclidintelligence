import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { TimeClockPanel } from "./TimeClockPanel";

export default function TimeClockPage() {
  const track = useTrack();
  return (
    <TrackShell>
      <div className="mx-auto w-full max-w-[1250px] p-4 lg:p-7">
        <header className="mb-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.16em] text-muted-foreground">Field labor</p>
          <h1 className="font-display text-3xl font-semibold">Time Clock</h1>
          <p className="mt-2 text-sm text-muted-foreground">Who is working, where they are working, and how those hours map to project cost codes.</p>
        </header>
        <TimeClockPanel companyLevel scopeCompanyId={track === "sub" ? "trueframe" : undefined} />
      </div>
    </TrackShell>
  );
}
