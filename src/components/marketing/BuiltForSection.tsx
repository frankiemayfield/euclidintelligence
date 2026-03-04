import { motion } from "framer-motion";
import { Hammer, Home, HardHat, Building2 } from "lucide-react";

const audiences = [
  {
    icon: Hammer,
    title: "Builders",
    desc: "Catch missing scope and send stronger client proposals.",
  },
  {
    icon: Home,
    title: "Remodelers",
    desc: "Navigate complex renovation estimates and avoid scope gaps.",
  },
  {
    icon: HardHat,
    title: "General Contractors",
    desc: "Benchmark subcontractor bids and maintain consistent estimating.",
  },
  {
    icon: Building2,
    title: "Developers",
    desc: "Generate structured early-stage budgets and track pricing variance.",
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
