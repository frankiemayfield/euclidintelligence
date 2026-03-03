import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, FileText, BarChart3, Bot } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 gradient-hero overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy + Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-5">
              Understand Your{" "}
              <span className="text-primary">Project Costs</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
              AI-powered construction estimating and bid intelligence — built on
              real project data. Upload plans, bid sheets, or scope docs and get
              structured estimates in minutes.
            </p>

            {/* Upload Card */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-card mb-6 max-w-md">
              <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/60 transition-colors cursor-pointer"
                onClick={() => navigate("/app/upload")}
              >
                <Upload className="mx-auto mb-3 text-primary" size={28} />
                <p className="font-display font-semibold text-sm text-foreground mb-1">
                  Drag & drop your project files
                </p>
                <p className="text-xs text-muted-foreground">
                  Plans · Bid sheets · Buildertrend exports · Scope docs · Takeoff sheets
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              <Button size="lg" onClick={() => navigate("/app/upload")}>
                Get My Estimate
              </Button>
              <Button size="lg" variant="outline">
                Book a Demo
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              No signup required. No credit card. Demo in under 60 seconds.
            </p>
          </motion.div>

          {/* Right: Product Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="bg-card border border-border rounded-xl shadow-lg p-6 space-y-4">
              {/* Bid Score Preview */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bid Score</p>
                  <p className="font-display text-4xl font-bold text-primary">84</p>
                </div>
                <div className="w-20 h-20 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
                  <svg className="absolute inset-0 w-20 h-20 -rotate-90">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(140,50%,32%)" strokeWidth="4" strokeDasharray="213.6" strokeDashoffset="34" strokeLinecap="round" />
                  </svg>
                  <BarChart3 className="text-primary" size={24} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Completeness", value: "92%", color: "text-primary" },
                  { label: "Trade Coverage", value: "88%", color: "text-primary" },
                  { label: "Pricing Confidence", value: "High", color: "text-success" },
                  { label: "Scope Gaps", value: "3 flags", color: "text-warning" },
                ].map((m) => (
                  <div key={m.label} className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className={`font-display font-semibold text-sm ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Atlas Suggestion */}
              <div className="bg-accent/50 rounded-lg p-4 flex items-start gap-3">
                <Bot className="text-primary mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="text-xs font-medium text-foreground">Estimator Atlas</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    "This estimate is missing electrical rough-in for the addition. I'd recommend adding a line item for ~$4,200 based on similar projects in your region."
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
