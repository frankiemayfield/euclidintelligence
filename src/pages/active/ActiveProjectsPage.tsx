import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CalendarClock, HardHat, MapPin, UserRound } from "lucide-react";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { projects, money } from "@/data/demoUniverse";
import { fmtLong, statusFor, todaysWork, upcoming } from "@/data/scheduleData";
import { cn } from "@/lib/utils";

export const activeProjectIds = ["downtown-ti", "fregolle"];

export default function ActiveProjectsPage() {
  const track = useTrack();
  const base = track === "sub" ? "/sub" : "/app";
  const list = projects.filter(p => activeProjectIds.includes(p.id));

  return (
    <TrackShell>
      <div className="app-shell py-4 lg:py-7">
        <header className="mb-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.16em] text-muted-foreground">Construction operations</p>
          <h1 className="font-display text-3xl font-semibold">{track === "sub" ? "Active Jobs" : "Active Projects"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">What is happening on the job, what is late, what is next, and what is costing money.</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          {list.map(p => {
            const s = statusFor(p.id);
            const next = upcoming(p.id, 1)[0];
            const today = todaysWork(p.id);
            const a = p.actuals;
            const draft = s.mode !== "active";
            return (
              <Link key={p.id} to={`${base}/active/${p.id}`} className="odyssey-surface group rounded-2xl p-5 transition-transform hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold">{p.name}</h2>
                    <p className="text-xs text-muted-foreground">{p.client}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin size={11} />{p.location}</p>
                  </div>
                  <span className={cn("rounded-full px-2.5 py-1 text-[9px] font-bold", draft ? "bg-muted text-muted-foreground" : "bg-success/15 text-success")}>{draft ? "Preconstruction" : "Construction"}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-4">
                  <div><p className="text-muted-foreground">Current phase</p><p className="font-semibold">{s.currentPhase}</p></div>
                  <div><p className="text-muted-foreground">Schedule</p><p className={cn("font-semibold", s.variance > 0 ? "text-warning" : "text-success")}>{s.variance > 0 ? `${s.variance} days behind baseline` : "On baseline"}</p></div>
                  <div><p className="text-muted-foreground">Progress</p><p className="font-semibold">{s.percentComplete}%</p></div>
                  <div><p className="text-muted-foreground">{a ? "Revised budget" : "Estimated cost"}</p><p className="font-semibold">{a ? money(a.revisedBudget) : p.builderCost ? money(p.builderCost) : "—"}</p></div>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted/60"><div className="h-full rounded-full bg-primary" style={{ width: `${s.percentComplete}%` }} /></div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
                  <div><p className="text-muted-foreground">Start</p><p>{fmtLong(s.currentStart)}</p></div>
                  <div><p className="text-muted-foreground">Projected completion</p><p>{fmtLong(s.forecastFinish)}</p></div>
                  <div className="flex items-center gap-1.5"><UserRound size={11} className="text-muted-foreground" />{s.projectManager}</div>
                  <div className="flex items-center gap-1.5"><HardHat size={11} className="text-muted-foreground" />{s.superintendent}</div>
                </div>

                {a && (
                  <div className="mt-3 grid grid-cols-2 gap-3 text-[11px]">
                    <div><p className="text-muted-foreground">Forecast</p><p className="font-semibold">{money(a.forecastAtCompletion)}</p></div>
                    <div><p className="text-muted-foreground">Today on site</p><p className="font-semibold">{today.length} activities</p></div>
                  </div>
                )}

                {next && <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground"><CalendarClock size={11} />Next: {next.title} — {fmtLong(next.start)}</p>}

                <div className="mt-3 flex items-center justify-between border-t border-border/45 pt-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-warning"><AlertTriangle size={12} />{a && a.forecastVariance > 0 ? `Forecast +${money(a.forecastVariance)}` : p.attention}</p>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">Open workspace <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" /></span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </TrackShell>
  );
}
