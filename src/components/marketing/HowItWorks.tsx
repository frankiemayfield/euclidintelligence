import { motion } from "framer-motion";
import { Upload, BarChart3, FileCheck } from "lucide-react";

const steps = [
{
  icon: Upload,
  title: "Upload your project files",
  desc: "Drop plans, bid sheets, Buildertrend exports, scope documents, or takeoff sheets. Bedrock reads them all."
},
{
  icon: BarChart3,
  title: "Review your Bid Score & estimate",
  desc: "Get a structured estimate, Bid Score, scope flags, and pricing confidence — organized and actionable."
},
{
  icon: FileCheck,
  title: "Finalize your proposal with Atlas",
  desc: "Use Estimator Atlas to refine line items, draft exclusions, and generate client-ready proposals."
}];


export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-muted/40">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">How it Works

          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">From upload to proposal in six simple steps.

          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) =>
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
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