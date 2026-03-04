import { motion } from "framer-motion";

const stats = [
  { value: "12,400+", label: "Projects Analyzed" },
  { value: "3.2M", label: "Line Items Indexed" },
  { value: "48,000+", label: "Cost Codes Normalized" },
  { value: "160+", label: "Trades Benchmarked" },
  { value: "38", label: "Regional Markets Covered" },
];

export function StatsBand() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="font-display text-3xl md:text-4xl font-bold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
