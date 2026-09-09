import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, FileText, Loader2, Search, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { complianceCompanies, complianceSummary, complianceTone, fmtDate, nextExpiration, type ComplianceState, type NetworkCompany } from "@/data/networkData";

const mark = (status?: ComplianceState) => {
  if (!status) return <span className="text-muted-foreground">—</span>;
  if (status === "In Compliance") return <span className="text-success">✓</span>;
  if (status === "Out of Compliance" || status === "Missing") return <span className="text-destructive">✕</span>;
  return <span className="text-warning">⚠</span>;
};

const processingSteps = [
  "Classifying document types",
  "Extracting company information",
  "Matching Network profiles",
  "Reading policy dates and limits",
  "Checking compliance requirements",
  "Identifying missing coverage",
  "Preparing review",
];

interface IntakeResult {
  file: string; type: string; detected: string; matchId?: string; match?: string; confidence: number;
  fields: [string, string][]; result: ComplianceState; reason: string; alternatives?: string[];
}

const sampleResults: IntakeResult[] = [
  {
    file: "TrueFrame_COI_2026.pdf", type: "General Liability / COI", detected: "TrueFrame Carpentry LLC", matchId: "trueframe", match: "TrueFrame Carpentry", confidence: 98,
    fields: [["Named insured", "TrueFrame Carpentry LLC"], ["Carrier", "Cincinnati Insurance"], ["Policy number", "GL-4471203"], ["Effective", "01/01/26"], ["Expires", "01/01/27"], ["Each occurrence", "$1,000,000"], ["Aggregate", "$2,000,000"], ["Additional insured", "Yes"], ["Waiver of subrogation", "Yes"], ["Certificate holder", "Mayfield & Co."]],
    result: "In Compliance", reason: "Meets all Mayfield general liability requirements with active dates.",
  },
  {
    file: "Spark_WorkersComp_2025.pdf", type: "Workers' Compensation", detected: "Spark Electric Co.", matchId: "spark-electric", match: "Spark Electric Co.", confidence: 96,
    fields: [["Carrier", "Ohio BWC"], ["Policy number", "WC-220041"], ["Effective", "09/01/25"], ["Expires", "08/31/26"], ["Coverage", "Statutory"]],
    result: "Out of Compliance", reason: "Workers Compensation policy expired 9 days ago.",
  },
  {
    file: "Riverstone_W9.pdf", type: "W-9", detected: "Riverstone Concrete Co.", matchId: "riverstone-concrete", match: "Riverstone Concrete", confidence: 91,
    fields: [["Legal name", "Riverstone Concrete Co."], ["Entity classification", "C-Corp"], ["Address", "215 River Rd, Cincinnati, OH"], ["Signed", "08/28/2026"]],
    result: "In Compliance", reason: "Current W-9 received — resolves the missing tax document.",
  },
  {
    file: "AquaFlow_Auto_Cert.pdf", type: "Commercial Auto", detected: "AquaFlow Plumbing Inc.", matchId: "aquaflow", match: "AquaFlow Plumbing", confidence: 94,
    fields: [["Carrier", "Grange"], ["Policy number", "CA-91002"], ["Effective", "05/01/26"], ["Expires", "05/01/27"], ["Combined single limit", "$1,000,000"]],
    result: "In Compliance", reason: "Meets $1M CSL commercial auto requirement.",
  },
  {
    file: "ClimateWorks_Endorsement.pdf", type: "Endorsement", detected: "ClimateWorks Mechanical LLC", matchId: "climateworks", match: "ClimateWorks Mechanical", confidence: 72,
    fields: [["Referenced policy", "GL-88342"], ["Endorsement", "Additional insured (referenced)"], ["Attachment", "Not included in upload"]],
    result: "Needs Review", reason: "Additional insured endorsement referenced but not included in uploaded document.",
    alternatives: ["ClimateWorks Mechanical", "Climate Works HVAC Services"],
  },
];

export default function CompliancePage() {
  const track = useTrack();
  const companies = complianceCompanies(track);
  const summary = complianceSummary(track);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [relationship, setRelationship] = useState("All");
  const [trade, setTrade] = useState("All trades");
  const [expiry, setExpiry] = useState("Any");
  const [intakeOpen, setIntakeOpen] = useState(false);

  const trades = useMemo(() => ["All trades", ...Array.from(new Set(companies.map(c => c.trade)))], [companies]);

  const rows = companies.filter(c =>
    (status === "All" || c.complianceOverall === status)
    && (relationship === "All" || (relationship === "Subs" ? c.relationship === "Subcontractor" : c.relationship === "Vendor"))
    && (trade === "All trades" || c.trade === trade)
    && c.name.toLowerCase().includes(query.toLowerCase()));

  const cards: { label: string; value: number; filter: string }[] = [
    { label: "Companies Monitored", value: summary.monitored, filter: "All" },
    { label: "In Compliance", value: summary.inCompliance, filter: "In Compliance" },
    { label: "Expiring Soon", value: summary.expiringSoon, filter: "Expiring Soon" },
    { label: "Missing Documents", value: summary.missing, filter: "Missing" },
    { label: "Out of Compliance", value: summary.outOfCompliance, filter: "Out of Compliance" },
    { label: "Needs Review", value: summary.needsReview, filter: "Needs Review" },
  ];

  const reqOf = (c: NetworkCompany, key: string) => c.compliance?.find(r => r.key === key)?.status;

  return (
    <TrackShell>
      <div className="mx-auto w-full max-w-[1320px] p-4 lg:p-7">
        <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase text-muted-foreground [letter-spacing:.16em]">Risk & documentation</p>
            <h1 className="font-display text-3xl font-semibold">Compliance</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Track insurance, tax, licensing, and vendor documentation across your network.</p>
          </div>
          <Button size="sm" onClick={() => setIntakeOpen(true)}><Upload size={14} /> Upload Documents</Button>
        </header>

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-6">
          {cards.map(c => (
            <button key={c.label} onClick={() => setStatus(c.filter)} className={cn("odyssey-surface rounded-xl p-4 text-left transition-all hover:-translate-y-0.5", status === c.filter && "ring-1 ring-primary/50")}>
              <p className="font-display text-xl font-bold">{c.value}</p>
              <p className="text-[10px] text-muted-foreground">{c.label}</p>
            </button>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex h-9 min-w-[200px] flex-1 items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 backdrop-blur-md">
            <Search size={14} className="text-muted-foreground" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search companies" className="w-full bg-transparent text-xs outline-none" />
          </div>
          {[{ v: status, set: setStatus, options: ["All", "In Compliance", "Expiring Soon", "Missing", "Needs Review", "Out of Compliance"] }, { v: relationship, set: setRelationship, options: ["All", "Subs", "Vendors"] }, { v: trade, set: setTrade, options: trades }, { v: expiry, set: setExpiry, options: ["Any", "Next 7 days", "Next 30 days", "Next 60 days", "Next 90 days"] }].map((s, i) => (
            <select key={i} value={s.v} onChange={e => s.set(e.target.value)} className="h-9 rounded-full border border-border/60 bg-card/50 px-3 text-xs outline-none backdrop-blur-md">
              {s.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
        </div>

        <div className="odyssey-surface overflow-hidden rounded-2xl" data-dense-workspace="true">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border/55 bg-muted/25">{["Company", "Relationship", "Trade / Category", "GL", "WC", "Auto", "W-9", "Other", "Overall Status", "Next Expiration"].map(h => <th key={h} className="whitespace-nowrap px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
              <tbody>
                {rows.map(c => (
                  <tr key={c.id} className="border-b border-border/45 hover:bg-card/45">
                    <td className="px-4 py-3"><Link to={`/network/${c.id}`} className="font-semibold hover:text-primary">{c.name}</Link></td>
                    <td className="px-4 py-3 text-xs">{c.relationship}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.trade}</td>
                    <td className="px-4 py-3">{mark(reqOf(c, "generalLiability"))}</td>
                    <td className="px-4 py-3">{mark(reqOf(c, "workersComp"))}</td>
                    <td className="px-4 py-3">{mark(reqOf(c, "commercialAuto"))}</td>
                    <td className="px-4 py-3">{mark(reqOf(c, "w9"))}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.relationship === "Vendor" ? "—" : "License optional"}</td>
                    <td className="px-4 py-3"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", complianceTone[c.complianceOverall ?? "Needs Review"])}>{c.complianceOverall}</span></td>
                    <td className="px-4 py-3 text-xs">{fmtDate(nextExpiration(c))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {intakeOpen && <ComplianceIntake onClose={() => setIntakeOpen(false)} />}
    </TrackShell>
  );
}

function ComplianceIntake({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<"upload" | "processing" | "review">("upload");
  const [files, setFiles] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (phase !== "processing") return;
    const timer = setInterval(() => setStep(s => {
      if (s >= processingSteps.length - 1) { clearInterval(timer); setTimeout(() => setPhase("review"), 600); return s; }
      return s + 1;
    }), 650);
    return () => clearInterval(timer);
  }, [phase]);

  const start = (names: string[]) => { setFiles(names.length ? names : sampleResults.map(r => r.file)); setStep(0); setPhase("processing"); };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-background/85 p-4 backdrop-blur-sm">
      <div className="odyssey-popover flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div><p className="font-display text-base font-bold">Compliance document intake</p><p className="text-[11px] text-muted-foreground">Euclid reads, classifies, and matches documents to your Network.</p></div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}><X size={15} /></Button>
        </div>

        <div className="overflow-y-auto p-5">
          {phase === "upload" && (
            <>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 bg-card/40 px-6 py-14 text-center">
                <Upload size={22} className="text-primary" />
                <p className="text-sm font-semibold">Drop compliance documents here</p>
                <p className="text-[11px] text-muted-foreground">COIs · Workers' Compensation · Auto · W-9s · Licenses · Endorsements</p>
                <input type="file" multiple className="hidden" onChange={e => start(Array.from(e.target.files ?? []).map(f => f.name))} />
              </label>
              <div className="mt-4 flex justify-center"><Button size="sm" variant="outline" onClick={() => start([])}>Use sample document set</Button></div>
            </>
          )}

          {phase === "processing" && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><Loader2 size={22} className="animate-spin text-primary" /></div>
              <h3 className="font-display text-lg font-bold">Reading compliance documents</h3>
              <p className="mt-1 text-xs text-muted-foreground">{files.length} documents in this batch</p>
              <div className="mx-auto mt-6 max-w-xs space-y-2.5 text-left">
                {processingSteps.map((s, i) => (
                  <div key={s} className="flex items-center gap-2.5">
                    {i < step ? <CheckCircle2 size={15} className="text-primary" /> : i === step ? <Loader2 size={15} className="animate-spin text-primary" /> : <span className="h-3.5 w-3.5 rounded-full border border-border" />}
                    <span className={cn("text-xs", i <= step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === "review" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-card/50 p-4">
                <p className="text-sm font-semibold">{sampleResults.length} documents processed</p>
                <p className="mt-1 text-[11px] text-muted-foreground">1 General Liability / COI · 1 Workers Compensation · 1 Commercial Auto · 1 W-9 · 1 Endorsement</p>
              </div>
              {sampleResults.map(r => (
                <div key={r.file} className="odyssey-surface rounded-2xl p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-semibold"><FileText size={13} className="text-primary" />{r.file}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">Classified as {r.type} · detected company {r.detected}</p>
                      <p className="mt-1 text-[11px]">Matched profile: <Link className="font-semibold text-primary" to={`/network/${r.matchId}`}>{r.match}</Link> · confidence {r.confidence}%</p>
                      {r.confidence < 90 && r.alternatives && <p className="mt-1 text-[11px] text-warning">Possible matches: {r.alternatives.join(" · ")} — select one to confirm.</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", complianceTone[r.result])}>{r.result}</span>
                      <Button size="sm" variant={confirmed[r.file] ? "outline" : "default"} className="h-7 text-[11px]" onClick={() => setConfirmed(c => ({ ...c, [r.file]: true }))}>{confirmed[r.file] ? "Confirmed" : "Confirm"}</Button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] sm:grid-cols-3">
                    {r.fields.map(([l, v]) => <div key={l} className="flex justify-between gap-2 border-b border-border/35 py-1"><span className="text-muted-foreground">{l}</span><span className="text-right font-medium">{v}</span></div>)}
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">{r.reason}</p>
                </div>
              ))}
              <div className="rounded-xl border border-dashed border-border/70 p-4 text-[11px] text-muted-foreground">
                No matching company found for a document? Create a new company pre-filled with extracted information, assign it to an existing company, or ignore it.
              </div>
            </div>
          )}
        </div>

        {phase === "review" && (
          <div className="flex justify-end gap-2 border-t border-border/60 px-5 py-3">
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
            <Button size="sm" onClick={onClose}>Apply to Network</Button>
          </div>
        )}
      </div>
    </div>
  );
}
