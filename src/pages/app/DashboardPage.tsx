import { AppLayout } from "@/components/app/AppLayout";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, MapPin, Plus, Search, ShieldCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { activities, companies, getProjectRoute, money, people, projects } from "@/data/demoUniverse";
import { useDemoProject } from "@/hooks/use-demo-project";
import { bidPipeline, builderAttention, builderFeed, builderNext, costPerformanceSummary, marketPulse } from "@/data/networkData";

const Panel = ({ title, action, children, count }: { title: string; action?: React.ReactNode; children: React.ReactNode; count?: string }) => (
  <div className="odyssey-surface overflow-hidden rounded-2xl">
    <div className="flex items-center justify-between border-b border-border/55 px-5 py-4">
      <h2 className="text-xs font-bold uppercase [letter-spacing:.14em]">{title}</h2>
      {count ? <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground">{count}</span> : action}
    </div>
    {children}
  </div>
);

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { setProjectId } = useDemoProject();
  const visibleProjects = projects.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.client.toLowerCase().includes(query.toLowerCase()));
  const openProject = (id: string) => { const project = projects.find(item => item.id === id); if (!project) return; setProjectId(id); navigate(getProjectRoute(project, "builder")); };
  const goto = (route: string, projectId?: string) => { if (projectId) setProjectId(projectId); navigate(route); };

  return <AppLayout><div className="app-shell py-4 lg:py-7">
    <section className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase text-muted-foreground [letter-spacing:.16em]">{companies.mayfield.name} · General Contractor</p>
        <h1 className="font-display text-3xl font-semibold text-foreground lg:text-4xl">Good afternoon, {people.frankie.firstName}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Six connected projects across preconstruction, proposals, and active construction.</p>
      </div>
      <Button asChild size="sm"><Link to="/app/new-project"><Plus size={14}/> New project</Link></Button>
    </section>

    {/* ACTIVE PROJECTS */}
    <section className="mb-7">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-[11px] font-bold uppercase text-muted-foreground [letter-spacing:.16em]">Active Projects</h2>
        <div className="flex items-center gap-3">
          <div className="flex h-8 items-center gap-2 rounded-full border border-border/60 bg-card/45 px-3 backdrop-blur-md"><Search size={13} className="text-muted-foreground"/><input value={query} onChange={e=>setQuery(e.target.value)} className="w-36 bg-transparent text-xs outline-none" placeholder="Find a project"/></div>
          <span className="text-[11px] font-semibold text-muted-foreground">{visibleProjects.length} projects</span>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleProjects.map(project=>
        <button key={project.id} onClick={()=>openProject(project.id)} className="odyssey-surface group relative overflow-hidden rounded-2xl p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
          <div className={cn("absolute inset-x-0 top-0 h-1",project.builderStatus.includes("Ready")?"bg-success/55":project.attention.includes("below")||project.attention.includes("exceeds")?"bg-destructive/55":"bg-primary/35")}/>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="min-w-0"><h3 className="truncate text-sm font-bold">{project.name}</h3><p className="mt-1 text-[10px] font-semibold uppercase text-muted-foreground">{project.jobNumber} · {project.type}</p></div>
            <span className="shrink-0 rounded-full bg-secondary/80 px-2.5 py-1 text-[9px] font-bold uppercase">{project.builderStatus}</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px]"><span className="font-semibold uppercase text-muted-foreground">{project.builderStage}</span><span className="flex items-center gap-1.5 text-muted-foreground"><MapPin size={12}/>{project.location}</span></div>
            <div className="grid grid-cols-3 gap-2 border-t border-border/50 pt-4 text-[10px]"><span><b className="block text-foreground">{project.builderCost?money(project.builderCost):"—"}</b>Cost</span><span><b className="block text-foreground">{project.clientPrice?money(project.clientPrice):"—"}</b>Client</span><span><b className="block text-foreground">{project.proposalScore ?? "—"}</b>Score</span></div>
            <p className="flex items-center gap-1 text-[11px] font-semibold text-primary">{project.attention.includes("generated")?<CheckCircle2 size={12}/>:<AlertTriangle size={12}/>} {project.attention}</p>
          </div>
        </button>)}
      </div>
    </section>

    {/* ATTENTION + WHAT'S NEXT */}
    <section className="mb-5 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <Panel title="Attention Needed" count={String(builderAttention.length)}>
        {builderAttention.map(item=>
          <button key={item.id} onClick={()=>goto(item.route,item.projectId)} className="flex w-full items-center gap-4 border-b border-border/50 px-5 py-3.5 text-left last:border-0 hover:bg-card/45">
            <span className={cn("h-2 w-2 shrink-0 rounded-full",item.tone==="danger"?"bg-destructive":item.tone==="warning"?"bg-warning":"bg-info")}/>
            <span className="min-w-0 flex-1">
              <b className="block text-sm">{item.project ?? item.company}</b>
              <span className="block text-[11px] text-muted-foreground">{item.title}</span>
              <span className="mt-1 inline-flex rounded-full bg-card/60 px-2 py-0.5 text-[9px] font-bold uppercase text-muted-foreground">{item.type}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-primary">{item.action} <ArrowRight size={12}/></span>
          </button>)}
      </Panel>
      <Panel title="What's Next">
        {builderNext.map((item,i)=>
          <button key={i} onClick={()=>goto(item.route,item.projectId)} className="flex w-full items-center gap-4 border-b border-border/50 px-5 py-3.5 text-left last:border-0 hover:bg-card/45">
            <span className="w-16 shrink-0 text-[10px] font-bold uppercase text-primary">{item.when}</span>
            <span className="min-w-0 flex-1"><b className="block text-sm">{item.project}</b><span className="text-[11px] text-muted-foreground">{item.task} · {item.destination}</span></span>
            <ArrowRight size={13} className="text-muted-foreground"/>
          </button>)}
      </Panel>
    </section>

    {/* BID PIPELINE + COST PERFORMANCE */}
    <section className="mb-5 grid gap-5 xl:grid-cols-2">
      <Panel title="Bid Pipeline" action={<Link to="/app/bid-leveling" className="text-[10px] font-semibold text-primary">View bid packages</Link>}>
        <div className="grid grid-cols-2 gap-3 px-5 py-4 sm:grid-cols-4">{bidPipeline.summary.map(s=><div key={s.label}><b className="block font-display text-lg">{s.value}</b><span className="text-[10px] text-muted-foreground">{s.label}</span></div>)}</div>
        {bidPipeline.packages.map(p=>
          <button key={p.id} onClick={()=>goto(p.route,p.projectId)} className="flex w-full items-center gap-4 border-t border-border/50 px-5 py-3 text-left hover:bg-card/45">
            <span className="min-w-0 flex-1"><b className="block text-sm">{p.project} — {p.trade}</b><span className="text-[11px] text-muted-foreground">{p.detail} · {p.note}</span></span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">Review <ArrowRight size={12}/></span>
          </button>)}
      </Panel>
      <Panel title="Cost Performance" action={<Link to="/app/est-vs-actual" className="text-[10px] font-semibold text-primary">Estimate vs Actual</Link>}>
        <div className="grid grid-cols-2 gap-3 px-5 py-4 sm:grid-cols-4">
          <div><b className="block font-display text-lg">{money(costPerformanceSummary.revisedBudgets)}</b><span className="text-[10px] text-muted-foreground">Revised Budgets</span></div>
          <div><b className="block font-display text-lg">{money(costPerformanceSummary.actualToDate)}</b><span className="text-[10px] text-muted-foreground">Actual Cost to Date</span></div>
          <div><b className="block font-display text-lg">{costPerformanceSummary.forecastOver}</b><span className="text-[10px] text-muted-foreground">Forecast Over Budget</span></div>
          <div><b className="block font-display text-lg">{costPerformanceSummary.unmappedCosts}</b><span className="text-[10px] text-muted-foreground">Unmapped Actual Costs</span></div>
        </div>
        {costPerformanceSummary.rows.map(row=>
          <button key={row.projectId} onClick={()=>goto("/app/est-vs-actual",row.projectId)} className="flex w-full items-center gap-4 border-t border-border/50 px-5 py-3 text-left hover:bg-card/45">
            <TrendingUp size={14} className="text-destructive"/>
            <span className="min-w-0 flex-1"><b className="block text-sm">{row.project}</b><span className="text-[11px] text-muted-foreground">Revised {money(row.revised)} · Forecast {money(row.forecast)} · Variance +{money(row.variance)}</span></span>
            <ArrowRight size={13} className="text-muted-foreground"/>
          </button>)}
        <div className="border-t border-border/50 px-5 py-3 text-[11px] text-muted-foreground">4 invoices require cost mapping.</div>
      </Panel>
    </section>

    {/* MARKET PULSE + ACTIVITY */}
    <section className="grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
      <Panel title="Market Pulse" action={<Link to="/app/estimate-comparison" className="text-[10px] font-semibold text-primary">View market intelligence</Link>}>
        <div className="px-5 py-4">
          <p className="text-[11px] font-semibold uppercase text-muted-foreground">{marketPulse.region}</p>
          <div className="mt-3 space-y-2">{marketPulse.movements.map(m=>
            <div key={m.label} className="flex items-center justify-between text-xs"><span>{m.label}</span><span className={cn("font-semibold",m.change>=0?"text-warning":"text-success")}>{m.change>=0?"+":""}{m.change}%</span></div>)}
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">{marketPulse.note}</p>
        </div>
      </Panel>
      <Panel title="Recent Activity" action={<Link to="/activity" className="text-[10px] font-semibold text-primary">View all</Link>}>
        {builderFeed.map(item=>
          <div key={item.id} className="flex gap-3 border-b border-border/50 px-5 py-3.5 last:border-0">
            <Clock3 size={13} className="mt-0.5 text-primary"/>
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{item.text}</p><p className="text-[10px] text-muted-foreground">{item.type} · {item.company} · {item.person} · {item.time}</p></div>
            <span className="shrink-0 rounded-full bg-secondary/80 px-2 py-0.5 text-[9px] font-bold uppercase">{item.status}</span>
          </div>)}
        {activities.length === 0 && <p className="px-5 py-4 text-xs text-muted-foreground">No activity yet.</p>}
      </Panel>
    </section>

    <p className="mt-5 flex items-center gap-2 text-[11px] text-muted-foreground"><ShieldCheck size={13} className="text-primary"/> Compliance status shown here is maintained from documents in Compliance.</p>
  </div></AppLayout>;
}
