import { Shield, Database, CheckCircle } from "lucide-react";

export function TrustStrip() {
  return (
    <section className="py-10 border-b border-border bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield size={18} className="text-primary" />
            <span className="text-sm font-medium">Trusted by builders, remodelers, and design-build teams</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Database size={18} className="text-primary" />
            <span className="text-sm font-medium">Built from real jobs, not generic price guesses</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle size={18} className="text-primary" />
            <span className="text-sm font-medium">Pilot-tested with regional GC teams</span>
          </div>
        </div>
      </div>
    </section>
  );
}
