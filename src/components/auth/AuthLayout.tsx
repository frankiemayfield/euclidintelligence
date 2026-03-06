import { ReactNode } from "react";
import { Link } from "react-router-dom";
import bedrockLogo from "@/assets/bedrock-logo-new.png";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-5">
        <Link to="/" className="inline-flex items-center gap-2">
          <img src={bedrockLogo} alt="Bedrock" className="h-8 w-auto" />
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Bedrock Analytics. All rights reserved.
      </footer>
    </div>
  );
}
