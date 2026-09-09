import { cn } from "@/lib/utils";

/**
 * Single dynamic brand source. The compass mark and the wordmark both take their
 * color from the active environment accent token (--env-accent), so header,
 * assistant launcher, assistant window, loading and empty states always match.
 */
export function EuclidCompass({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-hidden="true"
      className={cn("block shrink-0 text-[hsl(var(--env-accent))] transition-colors duration-300", className)}
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* hinge */}
        <circle cx="24" cy="9.5" r="5" strokeWidth="2.6" />
        <path d="M24 1.5v3.2" strokeWidth="2.6" />
        {/* legs */}
        <path d="M21.4 13.6 8.5 45.5" strokeWidth="3.2" />
        <path d="M26.6 13.6 39.5 45.5" strokeWidth="3.2" />
        {/* horizon rule + tick */}
        <path d="M10.5 24.5h27" strokeWidth="1.6" opacity=".9" />
        <path d="M24 20.5v8" strokeWidth="1.6" opacity=".9" />
      </g>
    </svg>
  );
}

export function EuclidWordmark({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <EuclidCompass className={cn("h-8 w-8", markClassName)} />
      <span
        aria-hidden="true"
        className="font-display text-[19px] font-bold uppercase leading-none tracking-[0.34em] text-[hsl(var(--env-accent))] transition-colors duration-300"
      >
        Euclid
      </span>
      <span className="sr-only">Euclid</span>
    </span>
  );
}
