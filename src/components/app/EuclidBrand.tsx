import euclidLogo from "@/assets/euclid-logo.png";
import { cn } from "@/lib/utils";

export function EuclidWordmark({ className }: { className?: string }) {
  return (
    <img src={euclidLogo} alt="Euclid" className={cn("block h-auto w-32 object-contain", className)} />
  );
}

export function EuclidCompass({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("relative block shrink-0 overflow-hidden", className)}>
      <img
        src={euclidLogo}
        alt=""
        className="absolute left-0 top-1/2 h-[142%] w-auto max-w-none -translate-y-1/2"
      />
    </span>
  );
}
