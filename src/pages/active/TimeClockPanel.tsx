import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Clock3, Coffee, Filter, LogIn, LogOut, Pencil, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  costTreatmentFor, entryCost, financialCost, inPeriod, periodOptions, summarize, timeEntries, treatmentTone,
  workerById, workerTypeFor, type Period, type TimeEntry, type TimeStatus,
} from "@/data/fieldData";
import { getProject, money, projects } from "@/data/demoUniverse";
import { fmtLong, laborScopes, laborConsumedPct, productionImpact, productionState, statusFor } from "@/data/scheduleData";
import { Dropdown, DropdownSelect } from "@/components/app/active/Dropdown";
import { EuclidImpact } from "@/components/app/active/EuclidImpact";

const statusTone: Record<TimeStatus, string> = {
  Active: "bg-primary/15 text-primary",
  Submitted: "bg-info/15 text-info",
  Complete: "bg-muted text-muted-foreground",
  "Needs Review": "bg-warning/20 text-warning",
  Edited: "bg-info/15 text-info",
  Approved: "bg-success/15 text-success",
};
const ALL = "All Active Projects";

export function TimeClockPanel({ projectId, scopeCompanyId, companyLevel }: { projectId?: string; scopeCompanyId?: string; companyLevel?: boolean }) {
  const activeProjects = projects.filter(p => statusFor(p.id).mode === "active");
  const [project, setProject] = useState<string>(projectId ?? (companyLevel ? ALL : activeProjects[0]?.id ?? "downtown-ti"));
  const [period, setPeriod] = useState<Period>("This Week");
  const [statusFilter, setStatusFilter] = useState<"All" | TimeStatus>("All");
  const [employer, setEmployer] = useState("All");
  const [trade, setTrade] = useState("All");
  const [relationship, setRelationship] = useState("All");
  const [costCode, setCostCode] = useState("All");
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [approved, setApproved] = useState<string[]>([]);

  const scoped = useMemo(() => timeEntries.filter(e => {
    const w = workerById(e.workerId);
    if (project !== ALL && e.projectId !== project) return false;
    if (scopeCompanyId && w.companyId !== scopeCompanyId) return false;
    return true;
  }), [project, scopeCompanyId]);

  const employers = Array.from(new Set(scoped.map(e => workerById(e.workerId).company)));
  const trades = Array.from(new Set(scoped.map(e => workerById(e.workerId).trade)));
  const codes = Array.from(new Set(scoped.map(e => e.costCode)));

  const periodEntries = scoped.filter(e => inPeriod(e, period));
  const rows = periodEntries.filter(e => {
    const w = workerById(e.workerId);
    const st = approved.includes(e.id) ? "Approved" : e.status;
    return (statusFilter === "All" || st === statusFilter)
      && (employer === "All" || w.company === employer)
      && (trade === "All" || w.trade === trade)
      && (costCode === "All" || e.costCode === costCode)
      && (relationship === "All" || (relationship === "Internal" ? workerTypeFor(w, scopeCompanyId) === "Internal Employee" : workerTypeFor(w, scopeCompanyId) !== "Internal Employee"))
      && (!search || w.name.toLowerCase().includes(search.toLowerCase()) || e.costCode.toLowerCase().includes(search.toLowerCase()) || (e.estimateLine ?? "").toLowerCase().includes(search.toLowerCase()));
  });

  const totals = summarize(periodEntries, scopeCompanyId);
  const current = scoped.filter(e => e.status === "Active");
  const scopes = laborScopes.filter(s => project === ALL || s.projectId === project);
  const statusOf = (e: TimeEntry): TimeStatus => (approved.includes(e.id) ? "Approved" : e.status);
  const toggle = (id: string) => setSelection(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));
  const filtersOn = [statusFilter, employer, trade, relationship, costCode].some(v => v !== "All");
  const contextLabel = `${project === ALL ? ALL : getProject(project).name} · ${period}`;

  return (
    <div className="space-y-3 pb-16">
      {/* scope */}
      <div className="odyssey-surface flex flex-wrap items-center gap-2 rounded-2xl px-3 py-2.5">
        <Dropdown label={`Project: ${project === ALL ? ALL : getProject(project).name}`} align="start" width="w-64">
          {companyLevel && <button onClick={() => setProject(ALL)} className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-card/70">{ALL}</button>}
          {activeProjects.map(p => (
            <button key={p.id} onClick={() => setProject(p.id)} className="w-full truncate rounded-lg px-2 py-1.5 text-left hover:bg-card/70">{p.name}</button>
          ))}
        </Dropdown>
        <Dropdown label={`Period: ${period}`} align="start" width="w-52">
          {periodOptions.map(p => <button key={p} onClick={() => setPeriod(p)} className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-card/70">{p}</button>)}
          <button className="w-full rounded-lg px-2 py-1.5 text-left text-muted-foreground hover:bg-card/70">Custom range…</button>
        </Dropdown>
        <div className="relative ml-auto min-w-[160px] flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search workers or entries..." className="w-full rounded-full border border-border/60 bg-transparent py-1.5 pl-8 pr-3 text-[11px] outline-none focus:border-primary/50" />
        </div>
        <Dropdown label="Filter" icon={Filter} active={filtersOn} width="w-64">
          <DropdownSelect label="Status" value={statusFilter} onChange={v => setStatusFilter(v as TimeStatus | "All")} options={["All", "Active", "Submitted", "Complete", "Needs Review", "Edited", "Approved"]} />
          <DropdownSelect label="Employer" value={employer} onChange={setEmployer} options={["All", ...employers]} />
          <DropdownSelect label="Trade" value={trade} onChange={setTrade} options={["All", ...trades]} />
          <DropdownSelect label="Cost code" value={costCode} onChange={setCostCode} options={["All", ...codes]} />
          <DropdownSelect label="Relationship" value={relationship} onChange={setRelationship} options={["All", "Internal", "Subcontractor"]} />
        </Dropdown>
      </div>

      {/* summary */}
      <div>
        <p className="mb-2 text-[11px] font-semibold text-muted-foreground">{contextLabel}</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[["Regular hours", `${totals.regular}`], ["Overtime", `${totals.overtime}`], ["Labor cost (financial actual)", money(totals.financial)], ["vs Labor budget", `+${money(totals.budgetVariance)}`]].map(([l, v], i) => (
            <div key={l} className="odyssey-surface rounded-xl p-4 text-center"><p className="text-[10px] text-muted-foreground">{l}</p><p className={cn("mt-1 font-display text-lg font-bold", i === 3 && "text-warning")}>{v}</p></div>
          ))}
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Financial actual excludes {money(totals.production)} of fixed-price subcontract crew time — that labor is tracked for production only and costs come from subcontract commitments and invoices.
        </p>
      </div>

      <section className="odyssey-surface rounded-2xl p-4">
        <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold"><Clock3 size={14} className="text-primary" />Currently Clocked In <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">{current.length}</span></h2>
        <div className="grid gap-2 md:grid-cols-2">
          {current.map(e => {
            const w = workerById(e.workerId);
            return (
              <div key={e.id} className="flex items-center gap-3 rounded-xl border border-border/50 p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">{w.initials}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold">{w.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{w.company} · {workerTypeFor(w, scopeCompanyId)}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{getProject(e.projectId).name} · {e.costCode}</p>
                </div>
                <div className="text-right text-[10px]"><p className="font-semibold">{e.clockIn}</p><p className="text-muted-foreground">{Math.floor(e.regular)}h {Math.round((e.regular % 1) * 60)}m</p></div>
                <div className="flex gap-1">
                  <button className="rounded-full border border-border/60 p-1.5" title="Break"><Coffee size={11} /></button>
                  <button className="rounded-full border border-border/60 p-1.5" title="Clock out"><LogOut size={11} /></button>
                </div>
              </div>
            );
          })}
          {!current.length && <p className="text-[11px] text-muted-foreground">Nobody is clocked in right now.</p>}
        </div>
        <button className="mt-3 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"><LogIn size={12} />Clock In Worker</button>
      </section>

      {/* entries */}
      <section className="odyssey-surface overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/50 px-4 py-3">
          <h2 className="font-display text-sm font-semibold">Time Entries</h2>
          <span className="text-[10px] text-muted-foreground">{rows.length} shown · {contextLabel}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-[11px]">
            <thead><tr className="border-b border-border/50 text-[10px] uppercase text-muted-foreground">
              <th className="w-8 px-3 py-2"></th>
              {["Worker", "Employer / relationship", "Date", "In", "Out", "Reg", "OT", "Cost mapping", "Cost treatment", "Labor cost", "Status"].map(h => <th key={h} className="px-3 py-2 text-left font-bold">{h}</th>)}
            </tr></thead>
            <tbody>
              {rows.map(e => {
                const w = workerById(e.workerId);
                const type = workerTypeFor(w, scopeCompanyId);
                const treatment = costTreatmentFor(w, scopeCompanyId);
                const fin = financialCost(e, scopeCompanyId);
                const open = expanded === e.id;
                return (
                  <>
                    <tr key={e.id} className={cn("border-b border-border/30", selection.includes(e.id) && "bg-primary/5")}>
                      <td className="px-3 py-2"><input type="checkbox" checked={selection.includes(e.id)} onChange={() => toggle(e.id)} className="h-3 w-3 accent-[hsl(var(--primary))]" /></td>
                      <td className="px-3 py-2">
                        <button onClick={() => setExpanded(open ? null : e.id)} className="flex items-center gap-1 font-medium">
                          {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}{w.name}
                        </button>
                        <span className="block pl-4 text-[10px] text-muted-foreground">{w.role}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="block">{w.company}</span>
                        <span className={cn("mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold", type === "Internal Employee" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>{type}</span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{e.date}</td>
                      <td className="px-3 py-2">{e.clockIn}</td>
                      <td className="px-3 py-2">{e.clockOut ?? "—"}</td>
                      <td className="px-3 py-2">{e.regular}</td>
                      <td className="px-3 py-2">{e.overtime || "—"}</td>
                      <td className="px-3 py-2 text-muted-foreground">{e.costCode}{e.estimateLine ? ` · ${e.estimateLine}` : ""}</td>
                      <td className="px-3 py-2"><span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold", treatmentTone[treatment])}>{treatment}</span></td>
                      <td className="px-3 py-2 font-semibold">{fin ? money(fin) : <span className="text-muted-foreground">{money(entryCost(e))} prod.</span>}</td>
                      <td className="px-3 py-2">
                        <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold", statusTone[statusOf(e)])}>{statusOf(e)}</span>
                        {e.notes && <span className="ml-1 inline-block align-middle" title={e.notes}><Pencil size={9} className="text-muted-foreground" /></span>}
                      </td>
                    </tr>
                    {open && (
                      <tr key={`${e.id}-detail`} className="border-b border-border/30 bg-card/40">
                        <td />
                        <td colSpan={11} className="px-3 py-3">
                          <div className="grid gap-3 md:grid-cols-4">
                            {[["Project", getProject(e.projectId).name], ["Phase", e.phase], ["Break", `${e.breakMinutes} min`],
                              ["Loaded rate", treatment === "Production Only" ? "n/a — fixed subcontract" : `${money(w.rate)}/hr`],
                              ["Regular / OT", `${e.regular} / ${e.overtime}`], ["Cost code", e.costCode], ["Estimate line", e.estimateLine ?? "—"],
                              ["Financial actual", fin ? money(fin) : "Not posted (production only)"]].map(([l, v]) => (
                              <div key={l}><p className="text-[10px] uppercase text-muted-foreground">{l}</p><p className="text-[11px] font-medium">{v}</p></div>
                            ))}
                          </div>
                          {e.notes && <p className="mt-2 text-[11px] text-muted-foreground">Note: {e.notes}</p>}
                          <div className="mt-2">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Edit &amp; approval history</p>
                            {e.history?.map((h, i) => <p key={i} className="text-[11px] text-muted-foreground">{fmtLong(h.date)} · {h.actor} — {h.action}</p>)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border/50 px-4 py-2 text-[11px] text-muted-foreground">
          {rows.length} entries · {money(rows.reduce((s, e) => s + financialCost(e, scopeCompanyId), 0))} posting to actual labor · {money(rows.reduce((s, e) => s + entryCost(e) - financialCost(e, scopeCompanyId), 0))} tracked as production only
        </div>
      </section>

      {/* labor performance */}
      <section className="odyssey-surface overflow-hidden rounded-2xl">
        <div className="border-b border-border/50 px-4 py-3">
          <h2 className="font-display text-sm font-semibold">Labor Performance</h2>
          <p className="text-[10px] text-muted-foreground">Estimated labor assumptions compared with approved hours, forecast and installed progress.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[11px]">
            <thead><tr className="border-b border-border/50 text-[10px] uppercase text-muted-foreground">
              {["Scope", "Est. hours", "Actual hours", "Forecast hours", "Variance", "Labor consumed", "Schedule progress", "Production"].map(h => <th key={h} className="px-3 py-2 text-left font-bold">{h}</th>)}
            </tr></thead>
            <tbody>
              {scopes.map(s => {
                const variance = s.forecastHours - s.estHours;
                const pct = Math.round((variance / s.estHours) * 1000) / 10;
                const state = productionState(s);
                return (
                  <tr key={s.id} className="border-b border-border/30">
                    <td className="px-3 py-2 font-medium">{s.scope}</td>
                    <td className="px-3 py-2">{s.estHours}</td>
                    <td className="px-3 py-2">{s.actualHours}</td>
                    <td className="px-3 py-2">{s.forecastHours}</td>
                    <td className={cn("px-3 py-2 font-semibold", variance > 0 ? "text-warning" : "text-success")}>{variance > 0 ? `+${variance} hrs / +${pct}%` : `${variance} hrs / ${pct}%`}</td>
                    <td className="px-3 py-2">{laborConsumedPct(s)}%</td>
                    <td className="px-3 py-2">{s.progress}%</td>
                    <td className="px-3 py-2"><span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold", state === "Production Risk" ? "bg-warning/20 text-warning" : state === "Ahead of Estimate" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>{state}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="space-y-2 border-t border-border/50 p-4">
          {scopes.filter(s => productionState(s) !== "On Pace").map(s => (
            <EuclidImpact key={s.id} domain="Labor" tone={productionState(s) === "Production Risk" ? "warning" : "positive"}
              headline={`${s.scope} — ${productionState(s)}`} message={productionImpact(s)} action={{ label: "Open Estimate vs Actual", to: "/app/est-vs-actual" }} />
          ))}
        </div>
      </section>

      {/* bulk action bar */}
      {selection.length > 0 && (
        <div className="odyssey-surface fixed bottom-5 left-1/2 z-[85] flex -translate-x-1/2 flex-wrap items-center gap-2 rounded-full px-4 py-2.5 shadow-xl">
          <span className="text-[11px] font-semibold">{selection.length} selected</span>
          <button onClick={() => { setApproved(a => Array.from(new Set([...a, ...selection]))); setSelection([]); }}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"><CheckCircle2 size={12} />Approve Selected</button>
          {["Change Project", "Change Phase", "Change Cost Mapping", "Flag for Review", "Remove"].map(a => (
            <button key={a} className="rounded-full border border-border/60 px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground">{a}</button>
          ))}
          <button onClick={() => setSelection([])} className="text-[11px] text-muted-foreground hover:text-foreground">Clear</button>
        </div>
      )}
    </div>
  );
}
