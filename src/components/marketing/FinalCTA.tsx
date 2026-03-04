import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
          Stop guessing. Start estimating with clarity.
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8">
          Upload your project files and get a structured estimate, Bid Score, and scope analysis in under 60 seconds.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={() => navigate("/app/upload")}>
            Get My Estimate
          </Button>
          <Button size="lg" variant="outline">
            Book a Demo
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          No signup required. No credit card. Free to try.
        </p>
      </div>
    </section>
  );
}
