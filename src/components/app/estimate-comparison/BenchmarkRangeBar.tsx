import { cn } from "@/lib/utils";

interface BenchmarkRangeBarProps {
  low: number;
  high: number;
  value: number;
  benchmark: number;
  className?: string;
}

export function BenchmarkRangeBar({ low, high, value, benchmark, className }: BenchmarkRangeBarProps) {
  const range = high - low;
  const pad = range * 0.15;
  const min = low - pad;
  const max = high + pad;
  const totalRange = max - min;

  const clamp = (v: number) => Math.max(0, Math.min(100, ((v - min) / totalRange) * 100));

  const rangeLeft = clamp(low);
  const rangeRight = clamp(high);
  const benchmarkPos = clamp(benchmark);
  const valuePos = clamp(value);

  const isBelow = value < low;
  const isAbove = value > high;

  return (
    <div className={cn("relative h-3 w-full", className)}>
      {/* Track */}
      <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-muted/40" />
      {/* Range zone */}
      <div
        className="absolute inset-y-0 rounded-full bg-primary/15"
        style={{ left: `${rangeLeft}%`, width: `${rangeRight - rangeLeft}%` }}
      />
      {/* Benchmark marker */}
      <div
        className="absolute top-0 bottom-0 w-px bg-muted-foreground/40"
        style={{ left: `${benchmarkPos}%` }}
      />
      {/* Value dot */}
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-card",
          isBelow ? "bg-destructive" : isAbove ? "bg-warning" : "bg-primary"
        )}
        style={{ left: `${valuePos}%`, marginLeft: "-6px" }}
      />
    </div>
  );
}
