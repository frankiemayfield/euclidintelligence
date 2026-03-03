import { Link } from "react-router-dom";
import bedrockLogo from "@/assets/bedrock-logo.png";

export function MarketingFooter() {
  return (
    <footer className="py-12 border-t border-border bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <img src={bedrockLogo} alt="Bedrock" className="h-11 w-auto mb-3" />
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Bedrock Analytics builds estimating intelligence for the construction industry. Practical, data-driven, and built from real project experience.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><Link to="/app" className="hover:text-foreground transition-colors">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center text-xs text-muted-foreground">
          © 2026 Bedrock Analytics. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
