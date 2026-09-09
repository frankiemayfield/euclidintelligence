import wordmarkDark from "@/assets/euclid-wordmark.png.asset.json";
import wordmarkLight from "@/assets/euclid-wordmark-light.png.asset.json";
import compass from "@/assets/euclid-compass.png.asset.json";
import { cn } from "@/lib/utils";

export function EuclidWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("relative block h-9 w-36 overflow-hidden", className)}>
      <img src={wordmarkLight.url} alt="Euclid" className="h-full w-full object-contain dark:hidden" />
      <img src={wordmarkDark.url} alt="Euclid" className="hidden h-full w-full object-contain dark:block" />
    </span>
  );
}

export function EuclidCompass({ className }: { className?: string }) {
  return <img src={compass.url} alt="" aria-hidden="true" className={cn("object-contain", className)} />;
}
