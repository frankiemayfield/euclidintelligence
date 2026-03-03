import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Download, Eye, FileText, ToggleLeft, ToggleRight } from "lucide-react";
import { useState } from "react";

const sections = [
  { title: "Proposal Summary", desc: "Executive overview with project details, total cost, and timeline", ready: true },
  { title: "Scope Summary", desc: "Detailed scope of work organized by trade with inclusions and exclusions", ready: true },
  { title: "Cost Breakdown", desc: "Client-friendly cost breakdown by category with subtotals", ready: true },
  { title: "Alternates & Options", desc: "Optional upgrades and value-engineering alternatives", ready: true },
  { title: "Allowance Schedule", desc: "Itemized allowances with descriptions and amounts", ready: true },
  { title: "Exclusions List", desc: "Items explicitly excluded from the scope and pricing", ready: true },
  { title: "Assumptions Log", desc: "All stated assumptions with source references and confidence levels", ready: true },
  { title: "Quantity Source Summary", desc: "How each quantity was derived — plan reference, method, and confidence", ready: true },
  { title: "Clarifications & Exclusions", desc: "Items requiring client clarification before finalizing", ready: true },
  { title: "Estimator Review Notes", desc: "Internal review comments and confirmation status per line item", ready: false },
  { title: "Terms & Conditions", desc: "Standard contract terms, payment schedule, and warranty info", ready: false },
];

export default function ProposalPage() {
  const [detailedMode, setDetailedMode] = useState(false);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Proposal Export</h1>
            <p className="text-sm text-muted-foreground mt-1">Generate client-facing proposal documents</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Eye size={14} className="mr-1.5" /> Preview</Button>
            <Button size="sm"><Download size={14} className="mr-1.5" /> Export PDF</Button>
          </div>
        </div>

        {/* Transparency Mode */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-card mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">Transparency Mode</h3>
            <p className="text-xs text-muted-foreground">
              {detailedMode
                ? "Detailed Review Package — includes assumptions, source references, and review notes"
                : "Client-Friendly Summary — clean presentation without internal notes"}
            </p>
          </div>
          <button onClick={() => setDetailedMode(!detailedMode)} className="text-primary">
            {detailedMode ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
          </button>
        </div>

        <div className="space-y-3">
          {sections.map((section) => {
            const isDetailOnly = ["Assumptions Log", "Quantity Source Summary", "Estimator Review Notes"].includes(section.title);
            if (!detailedMode && isDetailOnly) return null;

            return (
              <div key={section.title} className="bg-card border border-border rounded-xl p-5 shadow-card flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-sm text-foreground">{section.title}</h3>
                    {isDetailOnly && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-info/10 text-info font-medium">Detailed Only</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{section.desc}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  section.ready ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {section.ready ? "Ready" : "Draft"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex gap-2">
          <Button variant="outline"><Download size={14} className="mr-1.5" /> Export Excel</Button>
          <Button variant="outline"><Download size={14} className="mr-1.5" /> Export CSV</Button>
        </div>
      </div>
    </AppLayout>
  );
}
