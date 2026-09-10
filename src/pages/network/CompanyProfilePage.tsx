import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Mail, Pencil, Phone, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { complianceTone, fmtDate, getCompany, money } from "@/data/networkData";
import { projects } from "@/data/demoUniverse";

const tabsFor = (relationship: string) => {
  if (relationship === "Client" || relationship === "General Contractor") return ["Overview", "Contacts", "Projects", "Proposals", "Documents", "Notes"];
  if (relationship === "Vendor") return ["Overview", "Contacts", "Projects", "Purchasing & Price History", "Compliance", "Documents", "Notes"];
  return ["Overview", "Contacts", "Projects", "Bids & Pricing", "Cost Performance", "Compliance", "Documents", "Notes"];
};

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="odyssey-surface rounded-2xl p-5">
    <h3 className="mb-3 text-[11px] font-bold uppercase text-muted-foreground [letter-spacing:.14em]">{title}</h3>
    {children}
  </div>
);

export default function CompanyProfilePage() {
  const track = useTrack();
  const { companyId = "" } = useParams();
  const company = getCompany(track, companyId);
  const tabs = tabsFor(company?.relationship ?? "Subcontractor");
  const [tab, setTab] = useState(tabs[0]);

  if (!company) {
    return <TrackShell><div className="p-8"><p className="text-sm text-muted-foreground">Company not found.</p><Link to="/network" className="text-sm text-primary">Back to Network</Link></div></TrackShell>;
  }

  const primary = company.contacts.find(c => c.tags.includes("Primary")) ?? company.contacts[0];
  const shared = projects.filter(p => company.projectIds.includes(p.id));

  return (
    <TrackShell>
      <div className="mx-auto w-full max-w-[1250px] p-4 lg:p-7">
        <Link to="/network" className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft size={13} /> Network</Link>

        <header className="odyssey-surface mb-5 rounded-2xl p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <h1 className="font-display text-2xl font-semibold">{company.name}</h1>
              <p className="mt-1 text-xs text-muted-foreground">{company.relationship} · {company.trade} · {company.city}, {company.state}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold">
                <span className="rounded-full bg-secondary/80 px-2.5 py-1 uppercase">{company.status}</span>
                {company.complianceOverall && <span className={cn("rounded-full px-2.5 py-1", complianceTone[company.complianceOverall])}>{company.complianceOverall}</span>}
                {primary && <span className="text-muted-foreground">Primary contact: {primary.firstName} {primary.lastName} · {primary.title}</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild><a href={`mailto:${primary?.email ?? company.email}`}><Mail size={13} /> Email</a></Button>
              <Button size="sm" variant="outline"><Plus size={13} /> Add to Project</Button>
              {track === "builder" && company.relationship === "Subcontractor" && <Button size="sm" variant="outline" asChild><Link to="/app/bid-leveling">Start Bid Package</Link></Button>}
              <Button size="sm" variant="outline" asChild><Link to="/compliance"><Upload size={13} /> Upload Document</Link></Button>
              <Button size="sm" variant="ghost"><Pencil size={13} /> Edit</Button>
            </div>
          </div>
        </header>

        <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} className={cn("shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-colors", tab === t ? "bg-primary text-primary-foreground" : "bg-card/50 text-muted-foreground hover:text-foreground")}>{t}</button>
          ))}
        </div>

        {tab === "Overview" && (
          <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
            <div className="space-y-4">
              <Card title="Relationship summary">
                <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                  {[["Active Projects", String(shared.length)], ["Open Quotes", String(company.bids?.filter(b => b.result === "Pending").length ?? 0)], ["Awards", String(company.bids?.filter(b => b.result === "Awarded").length ?? 0)], ["Total Contracted", company.totalSpend ? money(company.totalSpend) : "—"]].map(([l, v]) => (
                    <div key={l}><b className="block font-display text-lg">{v}</b><span className="text-[10px] text-muted-foreground">{l}</span></div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">Last activity: {company.lastActivity}</p>
              </Card>
              <Card title="Company information">
                <dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                  {[["Legal name", company.legalName], ["DBA", company.dba ?? "—"], ["Address", `${company.address}, ${company.city}, ${company.state} ${company.zip}`], ["Main phone", company.phone], ["Main email", company.email], ["Website", company.website ?? "—"], ["Trade / category", company.trade], ["Service area", company.serviceArea], ["Tax / vendor ID", company.taxId ?? "—"]].map(([l, v]) => (
                    <div key={l} className="flex justify-between gap-3 border-b border-border/40 py-1.5"><dt className="text-muted-foreground">{l}</dt><dd className="text-right font-medium">{v}</dd></div>
                  ))}
                </dl>
              </Card>
            </div>
            <div className="space-y-4">
              {primary && <Card title="Primary contact"><p className="text-sm font-semibold">{primary.firstName} {primary.lastName}</p><p className="text-[11px] text-muted-foreground">{primary.title}</p><p className="mt-2 text-xs"><a className="text-primary" href={`mailto:${primary.email}`}>{primary.email}</a></p>{(primary.officePhone || primary.mobilePhone) && <p className="text-xs"><a className="text-primary" href={`tel:${(primary.officePhone ?? primary.mobilePhone)!.replace(/[^\d]/g, "")}`}>{primary.officePhone ?? primary.mobilePhone}</a></p>}</Card>}
              <Card title="Notes"><p className="text-xs text-muted-foreground">{company.notes || "No notes recorded."}</p></Card>
              {company.projectCompliance?.length ? (
                <Card title="Project compliance">
                  {company.projectCompliance.map(pc => (
                    <div key={pc.projectId} className="flex items-start gap-2 text-xs"><span className={cn("mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold", complianceTone[pc.state])}>{pc.state}</span><span>{projects.find(p => p.id === pc.projectId)?.name}: {pc.note}</span></div>
                  ))}
                </Card>
              ) : null}
            </div>
          </div>
        )}

        {tab === "Contacts" && (
          <div className="space-y-3">
            <div className="flex justify-end"><Button size="sm" variant="outline"><Plus size={13} /> Add Contact</Button></div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {company.contacts.map(c => (
                <div key={c.id} className="odyssey-surface rounded-2xl p-4">
                  <p className="text-sm font-semibold">{c.firstName} {c.lastName}</p>
                  <p className="text-[11px] text-muted-foreground">{c.title}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs"><Mail size={12} className="text-primary" /><a className="hover:text-primary" href={`mailto:${c.email}`}>{c.email}</a></p>
                  {c.officePhone && <p className="flex items-center gap-1.5 text-xs"><Phone size={12} className="text-primary" /><a className="hover:text-primary" href={`tel:${c.officePhone.replace(/[^\d]/g, "")}`}>{c.officePhone} (office)</a></p>}
                  {c.mobilePhone && <p className="flex items-center gap-1.5 text-xs"><Phone size={12} className="text-primary" /><a className="hover:text-primary" href={`tel:${c.mobilePhone.replace(/[^\d]/g, "")}`}>{c.mobilePhone} (mobile)</a></p>}
                  <p className="mt-2 text-[10px] text-muted-foreground">Preferred: {c.preferred}</p>
                  <div className="mt-2 flex flex-wrap gap-1">{c.tags.map(t => <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">{t}</span>)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Projects" && (
          <div className="odyssey-surface overflow-hidden rounded-2xl" data-dense-workspace="true">
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead><tr className="border-b border-border/55 bg-muted/25">{["Project", "Status", "Stage", "Bid / Contract", "Awarded", "Variance"].map(h => <th key={h} className="whitespace-nowrap px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
              <tbody>{shared.map(p => {
                const bid = company.bids?.find(b => b.projectId === p.id);
                const cost = company.costPerformance?.find(c => c.projectId === p.id);
                return (
                  <tr key={p.id} className="border-b border-border/45"><td className="px-4 py-3 font-semibold">{p.name}</td><td className="px-4 py-3 text-xs">{p.builderStatus}</td><td className="px-4 py-3 text-xs text-muted-foreground">{track === "sub" ? p.subStage : p.builderStage}</td><td className="px-4 py-3 text-xs">{bid ? money(bid.raw) : "—"}</td><td className="px-4 py-3 text-xs">{bid?.result === "Awarded" ? "Yes" : "—"}</td><td className="px-4 py-3 text-xs">{cost ? money(cost.actual - cost.revisedContract) : "—"}</td></tr>
                );
              })}</tbody>
            </table></div>
          </div>
        )}

        {(tab === "Bids & Pricing" || tab === "Proposals") && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              {[["Quotes Submitted", String(company.bids?.length ?? 0)], ["Awards", String(company.bids?.filter(b => b.result === "Awarded").length ?? 0)], ["Win Rate", company.bids?.length ? `${Math.round(((company.bids.filter(b => b.result === "Awarded").length) / company.bids.length) * 100)}%` : "—"], ["Average Bid", company.bids?.length ? money(company.bids.reduce((s, b) => s + b.raw, 0) / company.bids.length) : "—"], ["Avg Position vs Peers", "+1.6%"]].map(([l, v]) => (
                <div key={l} className="odyssey-surface rounded-xl p-4"><p className="font-display text-lg font-bold">{v}</p><p className="text-[10px] text-muted-foreground">{l}</p></div>
              ))}
            </div>
            <div className="odyssey-surface overflow-hidden rounded-2xl" data-dense-workspace="true">
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b border-border/55 bg-muted/25">{["Project", "Raw Bid", "Leveled", "Result", "Market Position"].map(h => <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
                <tbody>{(company.bids ?? []).map(b => (
                  <tr key={b.projectId} className="border-b border-border/45"><td className="px-4 py-3 font-semibold">{b.project}</td><td className="px-4 py-3">{money(b.raw)}</td><td className="px-4 py-3">{money(b.leveled)}</td><td className="px-4 py-3 text-xs">{b.result}</td><td className="px-4 py-3 text-xs">{b.marketPosition}</td></tr>
                ))}</tbody>
              </table></div>
            </div>
          </div>
        )}

        {tab === "Cost Performance" && (
          <div className="space-y-4">
            {(company.costPerformance ?? []).map(c => {
              const variance = c.actual - c.revisedContract;
              return (
                <div key={c.projectId} className="odyssey-surface rounded-2xl p-5">
                  <p className="text-sm font-semibold">{c.project}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-6">
                    {[["Original Quote", money(c.originalQuote)], ["Change Orders", money(c.changeOrders)], ["Revised Contract", money(c.revisedContract)], ["Actual Cost", money(c.actual)], ["Variance", `${variance < 0 ? "-" : "+"}${money(Math.abs(variance))} (${((variance / c.revisedContract) * 100).toFixed(1)}%)`], ["Invoices", String(c.invoices)]].map(([l, v]) => (
                      <div key={l}><b className="block">{v}</b><span className="text-[10px] text-muted-foreground">{l}</span></div>
                    ))}
                  </div>
                </div>
              );
            })}
            <Card title="Historical summary"><p className="text-xs text-muted-foreground">4 completed packages · average final variance +1.9% · average change-order exposure 2.4%</p></Card>
          </div>
        )}

        {tab === "Purchasing & Price History" && (
          <div className="space-y-4">
            <Card title="Purchasing summary"><p className="text-xs text-muted-foreground">Total spend {company.totalSpend ? money(company.totalSpend) : "—"} across {company.projectIds.length} projects.</p></Card>
            {(company.priceHistory ?? []).map(ph => {
              const first = ph.points[0].price; const last = ph.points[ph.points.length - 1].price;
              return (
                <div key={ph.item} className="odyssey-surface rounded-2xl p-5">
                  <p className="text-sm font-semibold">{ph.item} price history</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-5">
                    {ph.points.map(p => <div key={p.month}><b className="block">${p.price.toFixed(2)}</b><span className="text-[10px] text-muted-foreground">{p.month} / {ph.unit}</span></div>)}
                    <div><b className={cn("block", last >= first ? "text-warning" : "text-success")}>{last >= first ? "+" : ""}{(((last - first) / first) * 100).toFixed(1)}%</b><span className="text-[10px] text-muted-foreground">YTD movement</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "Compliance" && (
          <div className="space-y-4">
            <div className="odyssey-surface flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
              <div><p className="text-[11px] font-bold uppercase text-muted-foreground">Overall compliance status</p><p className="mt-1 font-display text-xl font-semibold">{company.complianceOverall ?? "Not tracked"}</p></div>
              <Button size="sm" variant="outline" asChild><Link to="/compliance"><Upload size={13} /> Upload Documents</Link></Button>
            </div>
            <div className="odyssey-surface overflow-hidden rounded-2xl" data-dense-workspace="true">
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b border-border/55 bg-muted/25">{["Requirement", "Status", "Effective", "Expires", "Limits / Details", "Source"].map(h => <th key={h} className="whitespace-nowrap px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
                <tbody>{(company.compliance ?? []).map(r => (
                  <tr key={r.key} className="border-b border-border/45">
                    <td className="px-4 py-3 font-semibold">{r.label}{r.carrier && <span className="block text-[10px] font-normal text-muted-foreground">{r.carrier} · {r.policyNumber}</span>}</td>
                    <td className="px-4 py-3"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", complianceTone[r.status])}>{r.status}</span></td>
                    <td className="px-4 py-3 text-xs">{fmtDate(r.effective)}</td>
                    <td className="px-4 py-3 text-xs">{fmtDate(r.expires)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.details ?? "—"}</td>
                    <td className="px-4 py-3 text-xs">{r.source ? <span className="inline-flex items-center gap-1 text-primary"><FileText size={12} />{r.source}</span> : "—"}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
          </div>
        )}

        {tab === "Documents" && (
          <div className="odyssey-surface rounded-2xl p-5">
            {(company.documents ?? []).length === 0 && <p className="text-xs text-muted-foreground">No documents uploaded yet.</p>}
            {(company.documents ?? []).map(d => (
              <div key={d.id} className="flex items-center gap-3 border-b border-border/45 py-3 last:border-0"><FileText size={14} className="text-primary" /><span className="flex-1 text-sm">{d.name}</span><span className="text-[10px] text-muted-foreground">{d.type} · {d.uploaded}</span></div>
            ))}
          </div>
        )}

        {tab === "Notes" && <Card title="Notes"><p className="text-xs text-muted-foreground">{company.notes || "No notes recorded."}</p></Card>}
      </div>
    </TrackShell>
  );
}
