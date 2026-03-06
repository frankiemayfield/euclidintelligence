import { SubLayout } from "@/components/sub/SubLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, AlertTriangle, Send, FileText, ChevronDown } from "lucide-react";
import { WorkflowTransition } from "@/components/app/WorkflowTransition";
import { useState } from "react";

interface QuoteVersion {
  version: string;
  date: string;
  total: number;
  coverage: number;
  missingScopeCount: number;
  clarificationsCount: number;
  exclusions: { item: string; disposition: string }[];
  addBacks: number;
  notes: string;
  status: string;
}

const quoteVersions: QuoteVersion[] = [
  {
    version: "v1 — Base Quote",
    date: "Mar 3, 2026",
    total: 23800,
    coverage: 88,
    missingScopeCount: 2,
    clarificationsCount: 3,
    exclusions: [
      { item: "Engineered lumber supply", disposition: "Carried by GC" },
      { item: "Temporary shoring", disposition: "Unresolved" },
    ],
    addBacks: 0,
    notes: "Initial quote based on GC scope package. Excludes engineered lumber supply per scope agreement.",
    status: "Submitted",
  },
  {
    version: "v2 — Revised Quote",
    date: "Mar 6, 2026",
    total: 25200,
    coverage: 96,
    missingScopeCount: 0,
    clarificationsCount: 1,
    exclusions: [
      { item: "Engineered lumber supply", disposition: "Carried by GC" },
    ],
    addBacks: 1400,
    notes: "Added temporary shoring and additional blocking per GC clarification. Header sizes confirmed per structural revision.",
    status: "Current",
  },
];

const clarifications = [
  { question: "Are header sizes per detail or per schedule?", resolved: true, answer: "Per structural detail — confirmed in Addendum 1" },
  { question: "Is temporary shoring scope of sub or GC?", resolved: true, answer: "Sub responsibility — added to v2 quote" },
  { question: "Confirm stair opening dimensions", resolved: false },
  { question: "Wall sheathing grade — OSB or plywood?", resolved: true, answer: "7/16\" OSB confirmed" },
];

const coverageItems = [
  { item: "Exterior wall framing", included: true },
  { item: "Interior bearing walls", included: true },
  { item: "Floor joists (I-joists)", included: true },
  { item: "Roof trusses", included: true },
  { item: "Wall sheathing", included: true },
  { item: "Roof sheathing", included: true },
  { item: "Blocking/nailers", included: true },
  { item: "Hardware (hangers/clips)", included: true },
  { item: "LVL header install (labor)", included: true },
  { item: "Temporary shoring", included: true },
  { item: "Engineered lumber supply", included: false },
];

const fmt = (n: number) => `$${n.toLocaleString()}`;

export default function SubBidLevelingPage() {
  const [expandedVersion, setExpandedVersion] = useState<string | null>("v2 — Revised Quote");
  const [transition, setTransition] = useState(false);

  return (
    <SubLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Bid Leveling</h1>
            <p className="text-sm text-muted-foreground mt-1">GC package vs your quote coverage — clarifications & revision tracking</p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setTransition(true)}>
            Build Estimate <ArrowRight size={14} />
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Quote Versions", value: quoteVersions.length },
            { label: "Current Coverage", value: "96%" },
            { label: "Open Clarifications", value: clarifications.filter(c => !c.resolved).length },
            { label: "Exclusions", value: quoteVersions[1].exclusions.length },
            { label: "Current Total", value: fmt(quoteVersions[1].total) },
          ].map(c => (
            <div key={c.label} className="bg-card border border-border rounded-xl p-3 shadow-card text-center">
              <p className="text-[10px] text-muted-foreground">{c.label}</p>
              <p className="font-display text-lg font-bold text-foreground mt-0.5">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Quote Version Comparison Table */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="font-display font-semibold text-foreground text-sm">Quote Versions</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["", "Version", "Date", "Total", "Coverage", "Missing Scope", "Clarifications", "Add-Backs", "Status"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quoteVersions.map((v) => (
                <>
                  <tr key={v.version} className="border-b border-border hover:bg-muted/20 cursor-pointer" onClick={() => setExpandedVersion(expandedVersion === v.version ? null : v.version)}>
                    <td className="px-4 py-3"><ChevronDown size={14} className={`text-muted-foreground transition-transform ${expandedVersion === v.version ? "rotate-180" : ""}`} /></td>
                    <td className="px-4 py-3 font-medium text-foreground">{v.version}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{v.date}</td>
                    <td className="px-4 py-3 font-display font-semibold text-foreground">{fmt(v.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${v.coverage >= 90 ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"}`}>{v.coverage}%</span>
                    </td>
                    <td className="px-4 py-3 text-xs">{v.missingScopeCount}</td>
                    <td className="px-4 py-3 text-xs">{v.clarificationsCount}</td>
                    <td className="px-4 py-3 text-xs">{v.addBacks > 0 ? fmt(v.addBacks) : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${v.status === "Current" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{v.status}</span>
                    </td>
                  </tr>
                  {expandedVersion === v.version && (
                    <tr key={`${v.version}-detail`}>
                      <td colSpan={9} className="bg-muted/10 px-6 py-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs font-medium text-foreground mb-2">Exclusions</p>
                            {v.exclusions.map((e, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <AlertTriangle size={10} className="text-warning shrink-0" />
                                <span>{e.item}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{e.disposition}</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-foreground mb-2">Notes</p>
                            <p className="text-xs text-muted-foreground">{v.notes}</p>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Button variant="outline" size="sm" className="text-xs justify-start"><Send size={11} className="mr-1.5" />Notify GC of Missing Scope</Button>
                            <Button variant="outline" size="sm" className="text-xs justify-start"><CheckCircle size={11} className="mr-1.5" />Confirm Included in Quote</Button>
                            <Button variant="outline" size="sm" className="text-xs justify-start"><FileText size={11} className="mr-1.5" />Generate Revised Quote</Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Clarifications */}
        <div className="bg-card border border-border rounded-xl shadow-card p-5 mb-6">
          <h2 className="font-display font-semibold text-foreground text-sm mb-3">Clarifications</h2>
          <div className="space-y-2">
            {clarifications.map((c, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${c.resolved ? "bg-muted/20" : "bg-warning/5 border border-warning/20"}`}>
                {c.resolved ? <CheckCircle size={14} className="text-primary shrink-0 mt-0.5" /> : <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />}
                <div>
                  <p className="text-sm text-foreground">{c.question}</p>
                  {c.answer && <p className="text-xs text-muted-foreground mt-0.5">Answer: {c.answer}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coverage Checklist */}
        <div className="bg-card border border-border rounded-xl shadow-card p-5">
          <h2 className="font-display font-semibold text-foreground text-sm mb-3">Scope Coverage Checklist</h2>
          <div className="space-y-1.5">
            {coverageItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {item.included ? <CheckCircle size={14} className="text-primary" /> : <AlertTriangle size={14} className="text-warning" />}
                <span className={item.included ? "text-foreground" : "text-muted-foreground"}>{item.item}</span>
                {!item.included && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/10 text-warning ml-auto">Excluded</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <WorkflowTransition
        active={transition}
        headline="Building your estimate"
        steps={[
          { label: "Refining scope" },
          { label: "Applying scope packages" },
          { label: "Organizing allowances" },
          { label: "Preparing estimate structure" },
        ]}
        targetPath="/sub/estimate-builder"
        onComplete={() => setTransition(false)}
      />
    </SubLayout>
  );
}
