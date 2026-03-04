import { motion } from "framer-motion";
import { Upload, Search, Scale, Calculator, BarChart3, FileOutput, ChevronRight } from "lucide-react";

const steps = [
  { icon: Upload, title: "Upload Documents" },
  { icon: Search, title: "Scope Analysis" },
  { icon: Scale, title: "Bid Leveling" },
  { icon: Calculator, title: "Estimate Builder" },
  { icon: BarChart3, title: "Pricing & Margin" },
  { icon: FileOutput, title: "Proposal Export" },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-muted/40">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            How it Works
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            From documents to proposal in six simple steps.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-y-8">
          {steps.map((s, i) => (
            <div key={s.title} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <s.icon className="text-primary" size={26} />
                </div>
                <div className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Step {i + 1}</div>
                <h3 className="font-display text-sm font-semibold text-foreground">{s.title}</h3>
              </motion.div>
              {i < steps.length - 1 && (
                <ChevronRight className="text-muted-foreground/50 mx-4 shrink-0" size={20} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
