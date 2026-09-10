import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Plus, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { complianceTone, getNetwork, money, type ComplianceState, type NetworkCompany } from "@/data/networkData";

const builderFilters = ["All", "Clients", "Subcontractors", "Vendors"] as const;
const subFilters = ["All", "Clients / GCs", "Subcontractors", "Vendors"] as const;

const inFilter = (company: NetworkCompany, filter: string) => {
  if (filter === "All") return true;
  if (filter === "Clients" || filter === "Clients / GCs") return company.relationship === "Client" || company.relationship === "General Contractor";
  if (filter === "Subcontractors") return company.relationship === "Subcontractor";
  return company.relationship === "Vendor";
};

export default function NetworkPage() {
  const track = useTrack();
  const network = getNetwork(track);
  const filters = track === "sub" ? subFilters : builderFilters;
  const [filter, setFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [trade, setTrade] = useState("All trades");
  const [compliance, setCompliance] = useState("All compliance");
  const [status, setStatus] = useState("All statuses");

  const trades = useMemo(() => ["All trades", ...Array.from(new Set(network.map(c => c.trade)))], [network]);

  const rows = network.filter(c =>
    inFilter(c, filter)
    && (c.name.toLowerCase().includes(query.toLowerCase()) || c.trade.toLowerCase().includes(query.toLowerCase()) || c.contacts.some(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(query.toLowerCase())))
    && (trade === "All trades" || c.trade === trade)
    && (compliance === "All compliance" || c.complianceOverall === compliance)
    && (status === "All statuses" || c.status === status));

  return (
    <TrackShell>
      <div className="mx-auto w-full max-w-[1250px] p-4 lg:p-7">
        <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase text-muted-foreground [letter-spacing:.16em]">Relationships</p>
            <h1 className="font-display text-3xl font-semibold">Network</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Companies, contacts, project history, bids, costs, and compliance in one place.</p>
          </div>
          <Button size="sm"><Plus size={14} /> Add Company</Button>
        </header>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex h-9 min-w-[220px] flex-1 items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 backdrop-blur-md">
            <Search size={14} className="text-muted-foreground" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search network" className="w-full bg-transparent text-xs outline-none" />
          </div>
          {[{ v: trade, set: setTrade, options: trades }, { v: compliance, set: setCompliance, options: ["All compliance", "In Compliance", "Expiring Soon", "Missing", "Needs Review", "Out of Compliance"] }, { v: status, set: setStatus, options: ["All statuses", "Active", "Prospect", "Inactive"] }].map((sel, i) => (
            <select key={i} value={sel.v} onChange={e => sel.set(e.target.value)} className="h-9 rounded-full border border-border/60 bg-card/50 px-3 text-xs outline-none backdrop-blur-md">
              {sel.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={cn("rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors", filter === f ? "bg-primary text-primary-foreground" : "bg-card/50 text-muted-foreground hover:text-foreground")}>{f}</button>
          ))}
        </div>

        <div className="odyssey-surface overflow-hidden rounded-2xl" data-dense-workspace="true">
          <div className="flex items-center justify-between border-b border-border/55 px-5 py-3">
            <h2 className="text-xs font-bold uppercase">Companies</h2>
            <span className="text-[11px] text-muted-foreground">{rows.length} of {network.length}</span>
          </div>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/55 bg-muted/25">
                  {["Company", "Relationship", "Trade / Category", "Primary Contact", "Email", "Phone", "Projects", "Recent Bid / Spend", "Compliance", "Status"].map(h => (
                    <th key={h} className="whitespace-nowrap px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(c => {
                  const primary = c.contacts.find(p => p.tags.includes("Primary")) ?? c.contacts[0];
                  const recent = c.bids?.[0]?.raw ?? c.totalSpend;
                  return (
                    <tr key={c.id} className="border-b border-border/45 hover:bg-card/45">
                      <td className="px-4 py-3"><Link to={`/network/${c.id}`} className="font-semibold hover:text-primary">{c.name}</Link><span className="block text-[10px] text-muted-foreground">{c.city}, {c.state}</span></td>
                      <td className="px-4 py-3 text-xs">{c.relationship}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{c.trade}</td>
                      <td className="px-4 py-3 text-xs">{primary ? `${primary.firstName} ${primary.lastName}` : "—"}</td>
                      <td className="px-4 py-3 text-xs"><a className="hover:text-primary" href={`mailto:${primary?.email ?? c.email}`}>{primary?.email ?? c.email}</a></td>
                      <td className="px-4 py-3 text-xs"><a className="hover:text-primary" href={`tel:${(primary?.officePhone ?? primary?.mobilePhone ?? c.phone).replace(/[^\d]/g, "")}`}>{primary?.officePhone ?? primary?.mobilePhone ?? c.phone}</a></td>
                      <td className="px-4 py-3 text-xs">{c.projectIds.length}</td>
                      <td className="px-4 py-3 text-xs font-semibold">{recent ? money(recent) : "—"}</td>
                      <td className="px-4 py-3">{c.complianceOverall
                        ? <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", complianceTone[c.complianceOverall as ComplianceState])}>{c.complianceOverall}</span>
                        : <span className="text-[10px] text-muted-foreground">Not tracked</span>}</td>
                      <td className="px-4 py-3 text-xs">{c.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-border/45 lg:hidden">
            {rows.map(c => (
              <Link key={c.id} to={`/network/${c.id}`} className="flex items-start gap-3 px-4 py-3 hover:bg-card/45">
                <Building2 size={15} className="mt-0.5 text-primary" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{c.name}</span>
                  <span className="block text-[10px] text-muted-foreground">{c.relationship} · {c.trade}</span>
                  {c.complianceOverall && <span className={cn("mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold", complianceTone[c.complianceOverall])}>{c.complianceOverall}</span>}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground"><ShieldCheck size={13} className="text-primary" /> Compliance status is maintained from uploaded source documents in Compliance.</p>
      </div>
    </TrackShell>
  );
}
