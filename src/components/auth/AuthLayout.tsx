import { ReactNode } from "react";
import { Link } from "react-router-dom";
import euclidLogo from "@/assets/euclid-logo.png";
import environment from "@/assets/euclid-environment.jpg";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="odyssey-app relative min-h-screen flex flex-col overflow-hidden">
      <img src={environment} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-55" width={1920} height={1080} />
      {/* Header */}
      <header className="relative z-10 w-full px-6 py-6">
        <Link to="/" className="inline-flex items-center gap-2">
          <img src={euclidLogo} alt="Euclid" className="h-8 w-auto" />
        </Link>
      </header>

      {/* Content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Euclid Intelligence. All rights reserved.
      </footer>
    </div>
  );
}
