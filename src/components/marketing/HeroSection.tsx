import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, BarChart3, Bot, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { WorkflowTransition } from "@/components/app/WorkflowTransition";

export function HeroSection() {
  const navigate = useNavigate();
  const [buildTransition, setBuildTransition] = useState(false);
  const [compareTransition, setCompareTransition] = useState(false);

  return (
    <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 gradient-hero overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy + Two Workflow Options */}
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

            {/* Two Workflow Cards */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6 max-w-lg">
              <div className="bg-card border border-border rounded-xl p-5 shadow-card hover:border-primary/40 hover:shadow-md transition-all flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <FileText size={18} className="text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground text-sm mb-1">Build Your Estimate</h3>
                <p className="text-xs text-muted-foreground mb-4 flex-1">
                  Upload plans and project files to start the full estimating workflow.
                </p>
                <Button size="sm" className="w-full gap-2" onClick={() => setBuildTransition(true)}>
                  Build an Estimate <ArrowRight size={14} />
                </Button>
              </div>

              <div className="bg-card border border-border rounded-xl p-5 shadow-card hover:border-primary/40 hover:shadow-md transition-all flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <BarChart3 size={18} className="text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground text-sm mb-1">Compare Your Proposal</h3>
                <p className="text-xs text-muted-foreground mb-4 flex-1">
                  Upload an existing estimate or proposal to compare it against similar jobs.
                </p>
                <Button size="sm" className="w-full gap-2" onClick={() => setCompareTransition(true)}>
                  <BarChart3 size={14} /> Market Comparison <ArrowRight size={14} />
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              No signup required. No credit card. Demo in under 60 seconds.
            </p>
          </motion.div>

          {/* Right: Proposal Score Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="bg-card border border-border rounded-xl shadow-lg p-6 space-y-4">
              {/* Proposal Score Preview */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Proposal Score</p>
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
                    "Electrical scope appears incomplete. Similar kitchen remodels typically include a rough-in allowance between $3,800 and $5,200."
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <WorkflowTransition
        active={buildTransition}
        headline="Building your estimate"
        steps={[
          { label: "Classifying documents" },
          { label: "Filling in project details" },
          { label: "Setting up workflow preferences" },
          { label: "Preparing your workspace" },
        ]}
        targetPath="/app/upload"
        onComplete={() => setBuildTransition(false)}
      />

      <WorkflowTransition
        active={compareTransition}
        headline="Comparing your pricing"
        steps={[
          { label: "Benchmark alignment analysis" },
          { label: "Comparing against thousands of estimates" },
          { label: "Analyzing market pricing" },
          { label: "Comparing costs and prices" },
          { label: "Generating proposal score" },
        ]}
        targetPath="/app/estimate-comparison?source=upload"
        onComplete={() => setCompareTransition(false)}
      />
    </section>
  );
}
