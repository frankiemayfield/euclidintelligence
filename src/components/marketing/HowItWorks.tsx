import { motion } from "framer-motion";
import { Upload, Search, Scale, Calculator, BarChart3, FileOutput, ChevronRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Documents",
    desc: "Upload plans, bid sheets, Buildertrend exports, scope documents, or takeoff sheets. Bedrock ingests and structures project data automatically."
  },
  {
    icon: Search,
    title: "Scope Analysis",
    desc: "The Scope Analyzer reviews project documents to detect missing scope, inconsistent assumptions, specification conflicts, and likely exclusions."
  },
  {
    icon: Scale,
    title: "Bid Leveling",
    desc: "Standardize subcontractor bids and scope assumptions so trades can be compared consistently across proposals."
  },
  {
    icon: Calculator,
    title: "Estimate Builder",
    desc: "Generate a structured estimate with line items, cost codes, trade breakdowns, and labor/material splits."
  },
  {
    icon: BarChart3,
    title: "Market Comparison",
    desc: "Benchmark your estimate against similar projects to evaluate pricing variance and calculate your Proposal Score."
  },
  {
    icon: FileOutput,
    title: "Proposal Export",
    desc: "Export client-ready proposals and estimates instantly to PDF, Excel, or CSV."
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-muted/40">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            From documents to proposal in six simple steps.
          </p>
        </div>

        {/* Layer 1 — Workflow Overview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-y-4 mb-16"
        >
          {steps.map((s, i) => (
            <div key={s.title} className="flex items-center">
              <div className="flex flex-col items-center gap-2 px-3 sm:px-5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <s.icon className="text-primary" size={22} />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
                  {s.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="text-muted-foreground/50 shrink-0 hidden sm:block" size={18} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Layer 2 — Step Details */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <s.icon className="text-primary" size={26} />
              </div>
              <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">Step {i + 1}</div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
