import { motion } from "framer-motion";
import { Upload, Search, Scale, Calculator, BarChart3, FileOutput, ChevronRight } from "lucide-react";

const steps = [
{
  icon: Upload,
  title: "Upload Documents",
  desc: "Upload project files and configure how Bedrock should structure your project before analysis."
},
{
  icon: Search,
  title: "Scope Analysis",
  desc: "The Scope Analyzer reviews documents to detect missing scope, assemble bid packages, and calculate quantity takeoffs."
},
{
  icon: Scale,
  title: "Bid Leveling",
  desc: "Standardize subcontractor bids and scope assumptions so trades can be compared consistently across your estimate."
},
{
  icon: Calculator,
  title: "Estimate Builder",
  desc: "Generate a structured estimate with line items, cost codes, trade breakdowns, and labor/material splits."
},
{
  icon: BarChart3,
  title: "Markup and Comparsion",
  desc: "Evaluate pricing variance, set margin targets, and see how your estimate compares to similar projects."
},
{
  icon: FileOutput,
  title: "Proposal Export",
  desc: "Export client-ready proposals and estimates instantly to PDF, Excel, or CSV."
}];


export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-muted/40">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">Our Estimating Workflow

          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            From documents to proposal in six simple steps.
          </p>
        </div>

        {/* Step Details */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) =>
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center">
            
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <s.icon className="text-primary" size={26} />
              </div>
              <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">Step {i + 1}</div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}