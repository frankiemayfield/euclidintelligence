import euclidLogo from "@/assets/euclid-logo.png";
import compassAsset from "@/assets/euclid-compass.png.asset.json";
import { cn } from "@/lib/utils";

/**
 * The original Euclid artwork is used as a mask so its exact proportions stay
 * intact while its color follows the selected workspace environment.
 */
export function EuclidCompass({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("block shrink-0 bg-[hsl(var(--env-accent))] transition-colors duration-300", className)}
      style={{
        WebkitMaskImage: `url(${compassAsset.url})`,
        maskImage: `url(${compassAsset.url})`,
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

export function EuclidWordmark({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("relative block h-[44px] w-32 shrink-0", className)}>
      <span
        aria-hidden="true"
        className={cn("absolute inset-0 block bg-[hsl(var(--env-accent))] transition-colors duration-300", markClassName)}
        style={{
          WebkitMaskImage: `url(${euclidLogo})`,
          maskImage: `url(${euclidLogo})`,
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
      <span className="sr-only">Euclid</span>
    </span>
  );
}
