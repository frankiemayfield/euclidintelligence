import { motion } from "framer-motion";
import { Hammer, Home, HardHat, Building2, Wrench } from "lucide-react";

const audiences = [
  {
    icon: Hammer,
    title: "Builders",
    desc: "Control costs on your own projects — validate estimates, track budget drift, and protect margins whether you're building spec homes or developing to sell.",
  },
  {
    icon: Home,
    title: "Remodelers",
    desc: "Navigate complex existing-condition estimates with scope intelligence that flags what's commonly missed in renovation work.",
  },
  {
    icon: HardHat,
    title: "General Contractors",
    desc: "Level sub bids, standardize cost codes, and maintain estimate accuracy across multiple concurrent projects and teams.",
  },
  {
    icon: Building2,
    title: "Developers",
    desc: "Get fast proforma-level estimates with trade-level detail, then track budget drift from estimate through closeout.",
  },
  {
    icon: Wrench,
    title: "Subcontractors",
    desc: "Build trade-specific quotes with scope checklists, labor and material defaults, and proposal export — tailored to your craft.",
  },
];

export function BuiltForSection() {
  return (
    <section id="built-for" className="py-20 bg-muted/40">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Built for the people who build
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Bedrock serves every role in the estimating and pre-construction workflow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {audiences.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-6 shadow-card text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <a.icon className="text-primary" size={24} />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{a.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
