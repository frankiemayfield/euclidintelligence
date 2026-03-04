import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";

interface TransitionStep {
  label: string;
}

interface WorkflowTransitionProps {
  active: boolean;
  headline: string;
  steps: TransitionStep[];
  targetPath: string;
  onComplete?: () => void;
}

export function WorkflowTransition({ active, headline, steps, targetPath, onComplete }: WorkflowTransitionProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!active) { setCurrentStep(0); return; }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete?.();
            navigate(targetPath);
          }, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [active, steps.length, targetPath, navigate, onComplete]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-center max-w-md mx-auto px-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Loader2 size={24} className="text-primary animate-spin" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">{headline}</h2>
            <p className="text-sm text-muted-foreground mb-8">Preparing your workspace…</p>

            <div className="space-y-3 text-left max-w-xs mx-auto">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: i <= currentStep ? 1 : 0.3, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.15, duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  {i < currentStep ? (
                    <CheckCircle size={16} className="text-primary shrink-0" />
                  ) : i === currentStep ? (
                    <Loader2 size={16} className="text-primary animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-border shrink-0" />
                  )}
                  <span className={`text-sm ${i <= currentStep ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
