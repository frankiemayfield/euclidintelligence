import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Establishing original budget from the approved estimate",
  "Creating the original contract from Pricing & Margin",
  "Creating awarded commitments from Bid Packages",
  "Building the selection schedule from allowances",
  "Linking estimate lines to schedule and cost codes",
  "Preparing financial controls",
];

export function StartConstruction({ projectName }: { projectName: string }) {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);

  const start = () => {
    setRunning(true);
    STEPS.forEach((_, i) => setTimeout(() => setDone(i + 1), (i + 1) * 550));
  };

  return (
    <section className="odyssey-surface rounded-2xl p-5">
      <h2 className="font-display text-sm font-semibold">Start construction</h2>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {projectName} is still in preconstruction. Euclid converts the existing estimate, proposal and awarded bids into operations and financial records — nothing is re-entered.
      </p>
      {!running ? (
        <button onClick={start} className="mt-3 rounded-full bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground">Start Construction</button>
      ) : (
        <div className="mt-3 space-y-1.5 text-[11px]">
          <p className="font-semibold">{done < STEPS.length ? "Preparing your project for construction" : "Project is ready for construction"}</p>
          {STEPS.map((s, i) => (
            <p key={s} className={cn("flex items-center gap-2", i < done ? "text-foreground" : "text-muted-foreground")}>
              {i < done ? <CheckCircle2 size={12} className="text-success" /> : <Loader2 size={12} className="animate-spin" />}{s}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
