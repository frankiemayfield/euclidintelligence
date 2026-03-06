import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { WorkflowTransition } from "@/components/app/WorkflowTransition";

export function FinalCTA() {
  const [buildTransition, setBuildTransition] = useState(false);
  const [compareTransition, setCompareTransition] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
          Stop guessing. Start estimating with clarity.
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8">
          Upload your project files and generate a structured estimate, Proposal Score, and trade-level market comparison in minutes.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" className="gap-2" onClick={() => setBuildTransition(true)}>
            Build an Estimate 
          </Button>
          <Button size="lg" className="gap-2" onClick={() => setCompareTransition(true)}>
            <BarChart3 size={14} /> Market Comparison
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          No signup required. No credit card. Free to try.
        </p>
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