import { motion } from "framer-motion";
import { BarChart3, FileSearch, Table2, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: BarChart3,
    title: "Proposal Score",
    desc: "Instantly see how strong your estimate is before sending it. Bedrock analyzes completeness, pricing variance, trade coverage, and scope gaps to generate a single proposal score.",
    detail: "Know where your proposal stands before it goes out.",
    link: "/app/bid-score",
  },
  {
    icon: FileSearch,
    title: "Scope Analyzer",
    desc: "Detect missing scope before it becomes a change order. Automatically surface missing assumptions, spec conflicts, and scope gaps from uploaded documents.",
    detail: "Catch what others miss — before it costs you.",
    link: "/app/scope-analyzer",
  },
  {
    icon: Table2,
    title: "Estimate Builder",
    desc: "Generate structured estimates with trade breakdowns, cost codes, labor/material splits, and export-ready proposals.",
    detail: "From raw data to client-ready proposal in minutes.",
    link: "/app/estimate-builder",
  },
  {
    icon: Bot,
    title: "Estimator Atlas",
    desc: "Your always-available estimating assistant. Atlas explains pricing variance, flags risky trades, and recommends adjustments based on real project benchmarks.",
    detail: "Like having a senior estimator on speed dial.",
    link: "/app/atlas",
  },
];

export function FeatureGrid() {
  const navigate = useNavigate();

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            The Four Systems Behind Every Proposal Score
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Everything you need to understand, validate, and present your project costs with confidence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(f.link)}
              className="group bg-card border border-border rounded-xl p-7 shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-300 cursor-pointer"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="text-primary" size={22} />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{f.desc}</p>
              <p className="text-xs font-medium text-primary">{f.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
