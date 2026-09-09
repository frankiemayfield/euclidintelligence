import { AppLayout } from "@/components/app/AppLayout";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, FileSearch, MapPin, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const projects = [
  { name: "Maple St. Kitchen Remodel", id: "EST-00234", type: "Remodel", region: "Chicago, IL", stage: "Pricing & Margin", status: "At Risk", lead: "Ryan Mitchell", detail: "7 attention items", accent: "danger" },
  { name: "Oakwood Custom Home", id: "EST-00239", type: "Custom Home", region: "Naperville, IL", stage: "Proposal Export", status: "Active", lead: "Ryan Mitchell", detail: "2 attention items", accent: "success" },
  { name: "Downtown TI — Suite 400", id: "EST-00241", type: "Tenant Finish", region: "Chicago, IL", stage: "Bid Packages", status: "In Review", lead: "Sarah Kim", detail: "Quotes verified", accent: "neutral" },
];

const attention = [
  { id: "EST-00234", title: "Margin is below company target", meta: "Critical · Pricing variance", color: "danger" },
  { id: "EST-00239", title: "Two scope items need confirmation", meta: "High · Scope review", color: "warning" },
  { id: "EST-00241", title: "Three trade bids remain outstanding", meta: "Bid package · Due Friday", color: "info" },
];

const schedule = [
  { time: "15:30", title: "Maple St. pricing review", detail: "Ryan Mitchell · Project room", state: "Confirmed" },
  { time: "17:00", title: "Oakwood proposal handoff", detail: "Client review package", state: "Ready" },
  { time: "Tomorrow", title: "Downtown TI bid cutoff", detail: "Three packages outstanding", state: "Pending" },
];

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const visibleProjects = projects.filter((project) => project.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1320px] p-4 lg:p-7">
        <section className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase text-muted-foreground [letter-spacing:.16em]">Mayfield & Co. · General Contractor</p>
            <h1 className="font-display text-3xl font-semibold text-foreground lg:text-4xl">Good afternoon, Sarah</h1>
            <p className="mt-2 text-sm text-muted-foreground">Your construction estimating workspace — Wednesday, September 9</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-foreground">14:59 UTC</p>
              <p className="text-[10px] font-semibold uppercase text-muted-foreground [letter-spacing:.1em]">09:59 · Chicago</p>
            </div>
            <Button asChild size="sm"><Link to="/app/new-project"><Plus size={14} /> New project</Link></Button>
          </div>
        </section>

        <section className="mb-7">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-[11px] font-bold uppercase text-muted-foreground [letter-spacing:.16em]">Active estimates</h2>
            <div className="flex items-center gap-3">
              <div className="flex h-8 items-center gap-2 rounded-full border border-border/60 bg-card/45 px-3 backdrop-blur-md">
                <Search size={13} className="text-muted-foreground" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-28 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground" placeholder="Find a project" />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">{visibleProjects.length} projects</span>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {visibleProjects.map((project) => (
              <Link key={project.id} to="/app/upload" className="odyssey-surface group relative overflow-hidden rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
                <div className={cn("absolute inset-x-0 top-0 h-1", project.accent === "danger" ? "bg-destructive/55" : project.accent === "success" ? "bg-success/55" : "bg-primary/35")} />
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-foreground">{project.name}</h3>
                    <p className="mt-1 text-[10px] font-semibold uppercase text-muted-foreground [letter-spacing:.08em]">{project.id} · {project.type}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary/80 px-2.5 py-1 text-[9px] font-bold uppercase text-secondary-foreground">{project.status}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold uppercase text-muted-foreground">{project.stage}</span>
                    <span className="flex items-center gap-1.5 text-muted-foreground"><MapPin size={12} />{project.region}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/50 pt-4 text-[10px]">
                    <span className="font-semibold text-muted-foreground">Lead: {project.lead}</span>
                    <span className={cn("flex items-center gap-1 font-bold", project.accent === "danger" ? "text-destructive" : project.accent === "success" ? "text-success" : "text-primary")}>
                      {project.accent === "success" ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}{project.detail}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
          <div className="odyssey-surface overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-border/55 px-5 py-4">
              <div className="flex items-center gap-2"><h2 className="text-xs font-bold uppercase text-foreground [letter-spacing:.12em]">Attention needed</h2><span className="rounded-full bg-destructive px-2 py-0.5 text-[9px] font-bold text-destructive-foreground">3</span></div>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-muted-foreground">View all <ArrowRight size={12} /></Button>
            </div>
            <div className="divide-y divide-border/50">
              {attention.map((item) => (
                <button key={item.title} className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-card/45">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", item.color === "danger" ? "bg-destructive" : item.color === "warning" ? "bg-warning" : "bg-info")} />
                  <span className="min-w-0 flex-1"><span className="block text-[10px] font-bold uppercase text-muted-foreground">{item.id}</span><span className="block truncate text-sm font-semibold text-foreground">{item.title}</span><span className="block text-[10px] text-muted-foreground">{item.meta}</span></span>
                  <ArrowRight size={14} className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>

          <div className="odyssey-surface overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-border/55 px-5 py-4">
              <h2 className="text-xs font-bold uppercase text-foreground [letter-spacing:.12em]">What’s next</h2>
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Central office</span>
            </div>
            <div className="space-y-1 p-3">
              {schedule.map((item) => (
                <div key={item.title} className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-card/45">
                  <div className="w-14 shrink-0"><p className="text-[10px] font-bold text-muted-foreground">{item.time}</p></div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{item.title}</p><p className="text-[10px] text-muted-foreground">{item.detail}</p></div>
                  <span className="rounded-full bg-secondary/80 px-2.5 py-1 text-[9px] font-bold uppercase text-secondary-foreground">{item.state}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border/55 px-5 py-3 text-[10px] text-muted-foreground"><Clock3 size={12} className="mr-1.5 inline" />Next sync in 6 minutes</div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
