import { SubLayout } from "@/components/sub/SubLayout";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { companies, getProjectRoute, getQuote, people, projects } from "@/data/demoUniverse";
import { useDemoProject } from "@/hooks/use-demo-project";
import { framingPulse, money, quotePipeline, subAttention, subDeadlines, subFeed } from "@/data/networkData";

const Panel = ({ title, action, children, count }: { title: string; action?: React.ReactNode; children: React.ReactNode; count?: string }) => (
  <div className="odyssey-surface overflow-hidden rounded-2xl">
    <div className="flex items-center justify-between border-b border-border/55 px-5 py-4">
      <h2 className="text-xs font-bold uppercase [letter-spacing:.14em]">{title}</h2>
      {count ? <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground">{count}</span> : action}
    </div>
    {children}
  </div>
);

export default function SubDashboardPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { setProjectId } = useDemoProject();
  const visible = projects.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  const open = (id: string) => { const p = projects.find(item => item.id === id); if (!p) return; setProjectId(id); navigate(getProjectRoute(p, "sub")); };
  const goto = (route: string, projectId?: string) => { if (projectId) setProjectId(projectId); navigate(route); };
  const downtown = projects.find(p => p.id === "downtown-ti");

  return <SubLayout><div className="mx-auto w-full max-w-[1320px] p-4 lg:p-7">
    <section className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase text-muted-foreground [letter-spacing:.16em]">{companies.trueframe.name} · Framing Subcontractor</p>
        <h1 className="font-display text-3xl font-semibold lg:text-4xl">Good afternoon, {people.tyler.firstName}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Six active quotes and jobs with Mayfield & Co. across estimating and construction.</p>
      </div>
      <Button asChild size="sm"><Link to="/sub/upload"><Plus size={14}/> New quote</Link></Button>
    </section>

    <section className="mb-7">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-[11px] font-bold uppercase text-muted-foreground [letter-spacing:.16em]">Active Quotes &amp; Jobs</h2>
        <div className="flex h-8 items-center gap-2 rounded-full border border-border/60 bg-card/45 px-3 backdrop-blur-md"><Search size={13} className="text-muted-foreground"/><input value={query} onChange={e=>setQuery(e.target.value)} className="w-36 bg-transparent text-xs outline-none" placeholder="Find a quote"/></div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map(project=>{
        const quote = getQuote(project);
        return (
          <button key={project.id} onClick={()=>open(project.id)} className="odyssey-surface group relative overflow-hidden rounded-2xl p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
            <div className={cn("absolute inset-x-0 top-0 h-1",project.subStatus.includes("Ready")?"bg-success/55":project.subStatus.includes("Awarded")?"bg-info/55":"bg-primary/35")}/>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0"><h3 className="truncate text-sm font-bold">{project.name}</h3><p className="mt-1 text-[10px] font-semibold uppercase text-muted-foreground">{companies.mayfield.name}</p></div>
              <span className="shrink-0 rounded-full bg-secondary/80 px-2.5 py-1 text-[9px] font-bold uppercase">{project.subStatus}</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px]"><span className="font-semibold uppercase text-muted-foreground">{project.subStage}</span><span className="text-muted-foreground">{project.bidDue ? `Due ${project.bidDue}` : "No due date"}</span></div>
              <div className="grid grid-cols-3 gap-2 border-t border-border/50 pt-4 text-[10px]">
                <span><b className="block text-foreground">{quote.currentAmount ? money(quote.currentAmount) : quote.preliminaryAmount ? `${money(quote.preliminaryAmount)}*` : "—"}</b>Quote</span>
                <span><b className="block text-foreground">{project.subProposalScore ?? "—"}</b>Score</span>
                <span><b className="block text-foreground">{project.scopeCoverage}%</b>Scope</span>
              </div>
              <p className="flex items-center gap-1 text-[11px] font-semibold text-primary">{project.subStatus.includes("Ready")?<CheckCircle2 size={12}/>:<AlertTriangle size={12}/>} {project.attention}</p>
            </div>
          </button>
        );
      })}</div>
    </section>

    <section className="mb-5 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <Panel title="Attention Needed" count={String(subAttention.length)}>
        {subAttention.map(item=>
          <button key={item.id} onClick={()=>goto(item.route,item.projectId)} className="flex w-full items-center gap-4 border-b border-border/50 px-5 py-3.5 text-left last:border-0 hover:bg-card/45">
            <span className={cn("h-2 w-2 shrink-0 rounded-full",item.tone==="danger"?"bg-destructive":item.tone==="warning"?"bg-warning":"bg-info")}/>
            <span className="min-w-0 flex-1"><b className="block text-sm">{item.project}</b><span className="block text-[11px] text-muted-foreground">{item.title}</span><span className="mt-1 inline-flex rounded-full bg-card/60 px-2 py-0.5 text-[9px] font-bold uppercase text-muted-foreground">{item.type}</span></span>
            <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-primary">{item.action} <ArrowRight size={12}/></span>
          </button>)}
      </Panel>
      <Panel title="Quote Deadlines">
        {subDeadlines.map((d,i)=>
          <button key={i} onClick={()=>goto(d.route,d.projectId)} className="flex w-full items-center gap-4 border-b border-border/50 px-5 py-3.5 text-left last:border-0 hover:bg-card/45">
            <span className={cn("w-14 shrink-0 text-[10px] font-bold uppercase",i===0?"text-destructive":i===1?"text-warning":"text-primary")}>{d.when}</span>
            <span className="min-w-0 flex-1"><b className="block text-sm">{d.project}</b><span className="text-[11px] text-muted-foreground">{companies.mayfield.name} · {d.task}</span></span>
            <ArrowRight size={13} className="text-muted-foreground"/>
          </button>)}
      </Panel>
    </section>

    <section className="mb-5 grid gap-5 xl:grid-cols-2">
      <Panel title="Quote Pipeline" action={<Link to="/sub/proposal" className="text-[10px] font-semibold text-primary">Open proposals</Link>}>
        <div className="grid grid-cols-2 gap-3 px-5 py-5 sm:grid-cols-5">{quotePipeline.map(s=><div key={s.label}><b className="block font-display text-xl">{s.value}</b><span className="text-[10px] text-muted-foreground">{s.label}</span></div>)}</div>
      </Panel>
      <Panel title="Job Performance" action={<Link to="/sub/est-vs-actual" className="text-[10px] font-semibold text-primary">Estimate vs Actual</Link>}>
        <div className="px-5 py-4">
          <p className="text-sm font-semibold">{downtown?.name}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <div><b className="block font-display text-base">{money(92750)}</b><span className="text-[10px] text-muted-foreground">Quoted contract</span></div>
            <div><b className="block font-display text-base">{money(89600)}</b><span className="text-[10px] text-muted-foreground">Actual cost</span></div>
            <div><b className="block font-display text-base text-success">-{money(3150)}</b><span className="text-[10px] text-muted-foreground">Variance</span></div>
            <div><b className="block font-display text-base">-2.1% / +0.8%</b><span className="text-[10px] text-muted-foreground">Labor / material</span></div>
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">Interior bearing-wall labor is averaging 8% above your estimating assumption.</p>
        </div>
      </Panel>
    </section>

    <section className="grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
      <Panel title="Your Pricing" action={<Link to="/sub/market-comparison" className="text-[10px] font-semibold text-primary">View market comparison</Link>}>
        <div className="px-5 py-4">
          <p className="text-[11px] font-semibold uppercase text-muted-foreground">{framingPulse.region}</p>
          <div className="mt-3 space-y-2">{framingPulse.movements.map(m=>
            <div key={m.label} className="flex items-center justify-between text-xs"><span>{m.label}</span><span className={cn("font-semibold",m.change>=0?"text-warning":"text-success")}>+{m.change}%</span></div>)}
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">{framingPulse.note}</p>
          <p className="mt-2 text-[11px] font-semibold text-warning">{framingPulse.outlier}</p>
        </div>
      </Panel>
      <Panel title="Recent Activity" action={<Link to="/activity" className="text-[10px] font-semibold text-primary">View all</Link>}>
        {subFeed.map(item=>
          <div key={item.id} className="flex gap-3 border-b border-border/50 px-5 py-3.5 last:border-0">
            <Clock3 size={13} className="mt-0.5 text-primary"/>
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{item.text}</p><p className="text-[10px] text-muted-foreground">{item.type} · {item.company} · {item.person} · {item.time}</p></div>
            <span className="shrink-0 rounded-full bg-secondary/80 px-2 py-0.5 text-[9px] font-bold uppercase">{item.status}</span>
          </div>)}
      </Panel>
    </section>
  </div></SubLayout>;
}
