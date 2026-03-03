import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Download, Eye, FileText } from "lucide-react";

export default function ProposalPage() {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Proposal Export</h1>
            <p className="text-sm text-muted-foreground mt-1">Generate client-facing proposal documents</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Eye size={14} className="mr-1.5" /> Preview</Button>
            <Button size="sm"><Download size={14} className="mr-1.5" /> Export PDF</Button>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { title: "Proposal Summary", desc: "Executive overview with project details, total cost, and timeline", ready: true },
            { title: "Scope Summary", desc: "Detailed scope of work organized by trade with inclusions and exclusions", ready: true },
            { title: "Cost Breakdown", desc: "Client-friendly cost breakdown by category with subtotals", ready: true },
            { title: "Alternates & Options", desc: "Optional upgrades and value-engineering alternatives", ready: true },
            { title: "Allowance Schedule", desc: "Itemized allowances with descriptions and amounts", ready: true },
            { title: "Exclusions List", desc: "Items explicitly excluded from the scope and pricing", ready: true },
            { title: "Terms & Conditions", desc: "Standard contract terms, payment schedule, and warranty info", ready: false },
          ].map((section) => (
            <div key={section.title} className="bg-card border border-border rounded-xl p-5 shadow-card flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-sm text-foreground">{section.title}</h3>
                <p className="text-xs text-muted-foreground">{section.desc}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                section.ready ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {section.ready ? "Ready" : "Draft"}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <Button variant="outline"><Download size={14} className="mr-1.5" /> Export Excel</Button>
          <Button variant="outline"><Download size={14} className="mr-1.5" /> Export CSV</Button>
        </div>
      </div>
    </AppLayout>
  );
}
