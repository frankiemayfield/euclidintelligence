import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Clock3, Search } from "lucide-react";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { activityFilters, activityFor, activityGroups, fmtWhen, matchesFilter, urgencyTone } from "@/data/activityData";
import { projects } from "@/data/demoUniverse";
import { cn } from "@/lib/utils";

export default function ActivityPage() {
  const track = useTrack();
  const [filter, setFilter] = useState<string>("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [search, setSearch] = useState("");
  const events = activityFor(track);

  const rows = useMemo(() => events.filter(e =>
    matchesFilter(e, filter) &&
    (projectFilter === "All" || e.projectId === projectFilter) &&
    (!search || e.summary.toLowerCase().includes(search.toLowerCase()) || (e.company ?? "").toLowerCase().includes(search.toLowerCase()))
  ), [events, filter, projectFilter, search]);

  return (
    <TrackShell>
      <div className="mx-auto w-full max-w-[980px] p-4 lg:p-7">
        <header className="mb-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.16em] text-muted-foreground">Company timeline</p>
          <h1 className="font-display text-3xl font-semibold">Activity</h1>
          <p className="mt-2 text-sm text-muted-foreground">Everything happening across preconstruction and active construction — schedule, cost, field, compliance and documents.</p>
        </header>

        <div className="odyssey-surface mb-3 flex flex-wrap items-center gap-2 rounded-2xl px-4 py-3">
          <div className="relative min-w-[180px] flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search activity..." className="w-full rounded-full border border-border/60 bg-transparent py-1.5 pl-8 pr-3 text-[11px] outline-none focus:border-primary/50" />
          </div>
          <Dropdown label={projectFilter === "All" ? "All projects" : getProject(projectFilter).name} icon={Building2} active={projectFilter !== "All"} width="w-72">
            <button onClick={() => setProjectFilter("All")} className={cn("w-full rounded-lg px-2 py-1.5 text-left hover:bg-card/70", projectFilter === "All" && "text-primary")}>All projects</button>
            {projects.map(p => (
              <button key={p.id} onClick={() => setProjectFilter(p.id)} className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-card/70", projectFilter === p.id && "text-primary")}>
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </Dropdown>
          <Dropdown label={filter === "All" ? "All categories" : filter} icon={SlidersHorizontal} active={filter !== "All"} width="w-56">
            {activityFilters.map(f => (
              <button key={f} onClick={() => setFilter(f)} className={cn("w-full rounded-lg px-2 py-1.5 text-left hover:bg-card/70", filter === f && "text-primary")}>{f === "All" ? "All categories" : f}</button>
            ))}
          </Dropdown>
        </div>

        <div className="odyssey-surface overflow-hidden rounded-2xl">
          {rows.map(item => (
            <div key={item.id} className="flex gap-3 border-b border-border/45 px-5 py-4 last:border-0">
              <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", urgencyTone[item.urgency])} />
              <div className="min-w-0 flex-1">
                {item.route ? <Link to={item.route} className="text-sm font-semibold hover:text-primary">{item.summary}</Link> : <p className="text-sm font-semibold">{item.summary}</p>}
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {item.type} · {activityGroups[item.type]}{item.project ? ` · ${item.project}` : ""}{item.company ? ` · ${item.company}` : ""} · {item.actor} · {fmtWhen(item.timestamp)}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-secondary/80 px-2 py-0.5 text-[9px] font-bold uppercase">{item.status}</span>
            </div>
          ))}
          {!rows.length && <p className="p-6 text-center text-sm text-muted-foreground"><Clock3 size={14} className="mr-1 inline" />No activity matches these filters.</p>}
        </div>
      </div>
    </TrackShell>
  );
}
