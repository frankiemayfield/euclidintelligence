import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, BarChart3, Bot, ArrowRight, Gauge, Target, ShieldCheck } from "lucide-react";
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
            transition={{ duration: 0.6 }}>
            
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
                <h3 className="font-display font-semibold text-foreground text-sm mb-1">Build an  Estimate</h3>
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
                   Market Comparison <ArrowRight size={14} />
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
            className="hidden lg:block">
            
            {/* Score Panel — matches Market Comparison page exactly */}
            <div className="bg-card border border-border rounded-2xl shadow-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 shrink-0">
                    <svg className="w-16 h-16 -rotate-90">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                      <circle cx="32" cy="32" r="26" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="163.4" strokeDashoffset="26" strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold text-primary">84</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Proposal Score</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Strong benchmark alignment</p>
                  </div>
                </div>
                {/* Market Sensitivity */}
                <div className="bg-muted/20 rounded-lg p-2.5 text-center shrink-0">
                  <Gauge size={14} className="mx-auto text-muted-foreground mb-1" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Market Sensitivity</p>
                  <p className="font-display text-xs font-bold text-primary">Likely Competitive</p>
                  <p className="text-[10px] text-muted-foreground">+2.5% vs local median</p>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-border" />

              {/* Market Context */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-xs">
                <div><span className="text-muted-foreground">Compared Against</span> <span className="text-foreground font-medium ml-1">20,184 estimates</span></div>
                <div><span className="text-muted-foreground">Region</span> <span className="text-foreground font-medium ml-1">Midwest</span></div>
                <div><span className="text-muted-foreground">Project Type</span> <span className="text-foreground font-medium ml-1">Remodel</span></div>
                <div><span className="text-muted-foreground">Size Band</span> <span className="text-foreground font-medium ml-1">2,000–4,000 SF</span></div>
                <div><span className="text-muted-foreground">Spec Level</span> <span className="text-foreground font-medium ml-1">Premium</span></div>
                <div><span className="text-muted-foreground">Pricing Mode</span> <span className="text-foreground font-medium ml-1">Cost Plus</span></div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-border" />

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                { label: "Completeness", value: "92%", color: "text-primary" },
                { label: "Trade Coverage", value: "88%", color: "text-primary" },
                { label: "Pricing Confidence", value: "High", color: "text-primary" },
                { label: "Overall Variance", value: "+4.8%", color: "text-warning" },
                { label: "Gross Margin", value: "24.0%", color: "text-primary", sub: "Peer: 16.2%" },
                { label: "Scope Gaps", value: "3 flags", color: "text-warning" }].

                map((m) =>
                <div key={m.label} className="bg-muted/20 rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    <p className={`font-display font-semibold text-sm ${m.color}`}>{m.value}</p>
                    {m.sub && <p className="text-[10px] text-muted-foreground">{m.sub}</p>}
                  </div>
                )}
              </div>


              {/* Quick View */}
              <div className="bg-muted/20 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Quick View</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Target size={10} className="text-destructive shrink-0" />
                    <span className="text-muted-foreground">Top Risk:</span>
                    <span className="text-foreground font-medium">HVAC under-scope</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={10} className="text-primary shrink-0" />
                    <span className="text-muted-foreground">Strongest:</span>
                    <span className="text-foreground font-medium">Electrical, Plumbing</span>
                  </div>
                </div>
              </div>

              {/* Atlas Insight */}
              <div className="bg-accent/50 rounded-lg p-3 flex items-start gap-3">
                <Bot className="text-primary mt-0.5 shrink-0" size={16} />
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
        { label: "Preparing your workspace" }]
        }
        targetPath="/app/upload"
        onComplete={() => setBuildTransition(false)} />
      

      <WorkflowTransition
        active={compareTransition}
        headline="Comparing your pricing"
        steps={[
        { label: "Benchmark alignment analysis" },
        { label: "Comparing against thousands of estimates" },
        { label: "Analyzing market pricing" },
        { label: "Comparing costs and prices" },
        { label: "Generating proposal score" }]
        }
        targetPath="/app/estimate-comparison?source=upload"
        onComplete={() => setCompareTransition(false)} />
      
    </section>);

}