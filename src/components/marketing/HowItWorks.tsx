import { motion } from "framer-motion";
import { Upload, Search, Scale, Calculator, BarChart3, FileOutput, ArrowRight, ArrowDown } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Documents",
    desc: "Upload project files and configure how Euclid should structure your project before analysis.",
  },
  {
    icon: Search,
    title: "Scope Analysis",
    desc: "The Scope Analyzer reviews documents to detect missing scope, assemble bid packages, and calculate quantity takeoffs.",
  },
  {
    icon: Scale,
    title: "Bid Leveling",
    desc: "Standardize subcontractor bids and scope assumptions so trades can be compared consistently across your estimate.",
  },
  {
    icon: Calculator,
    title: "Estimate Builder",
    desc: "Generate a structured estimate with line items, cost codes, trade breakdowns, and labor/material splits.",
  },
  {
    icon: BarChart3,
    title: "Markup & Comparison",
    desc: "Evaluate pricing variance, set margin targets, and see how your estimate compares to similar projects.",
  },
  {
    icon: FileOutput,
    title: "Proposal Export",
    desc: "Customize, edit, and format your estimate. Export client-ready proposals instantly to PDF, Excel, or CSV.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-muted/40">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Our Estimating Workflow
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            From documents to proposal in six simple steps.
          </p>
        </div>

        {/* Desktop: horizontal flow with arrows */}
        <div className="hidden lg:flex items-start justify-center gap-0">
          {steps.map((s, i) => (
            <div key={s.title} className="flex items-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="flex flex-col items-center text-center w-44"
              >
                <div className="w-16 h-16 rounded-2xl bg-card border border-border shadow-card flex items-center justify-center mb-3">
                  <s.icon className="text-primary" size={28} />
                </div>
                <h3 className="font-display text-sm font-semibold text-foreground mb-1.5">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed px-1">{s.desc}</p>
              </motion.div>

              {i < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 + 0.06 }}
                  className="flex items-center px-2" style={{ marginTop: '72px' }}
                >
                  <ArrowRight className="text-primary/40" size={20} />
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Tablet: 3-col grid with arrows */}
        <div className="hidden md:grid lg:hidden grid-cols-3 gap-x-4 gap-y-8">
          {steps.map((s, i) => (
            <div key={s.title} className="flex flex-col items-center relative">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-5 shadow-card text-center w-full"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <s.icon className="text-primary" size={26} />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>

              {i < steps.length - 1 && i !== 2 && (
                <ArrowRight className="absolute -right-4 top-1/2 -translate-y-1/2 text-primary/30" size={18} />
              )}
              {i === 2 && (
                <ArrowDown className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-primary/30" size={18} />
              )}
            </div>
          ))}
        </div>

        {/* Mobile: vertical flow with arrows */}
        <div className="flex md:hidden flex-col items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.title} className="flex flex-col items-center w-full max-w-sm">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-5 shadow-card flex items-start gap-4 w-full"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <s.icon className="text-primary" size={22} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground mb-1">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>

              {i < steps.length - 1 && (
                <ArrowDown className="text-primary/30 my-1" size={16} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
