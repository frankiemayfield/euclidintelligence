import { cn } from "@/lib/utils";
import { TASK_COLOR_SWATCHES, useTaskColors } from "@/lib/taskColors";

function SwatchGrid({ value, onPick }: { value: string; onPick: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {TASK_COLOR_SWATCHES.map(c => (
        <button key={c} onClick={e => { e.preventDefault(); onPick(c); }} title={c}
          style={{ backgroundColor: c }}
          className={cn("h-4 w-4 rounded-full ring-1 ring-inset ring-black/20", value.toLowerCase() === c && "outline outline-2 outline-offset-1 outline-foreground/60")} />
      ))}
    </div>
  );
}

/** Trade color legend + editor, used in the schedule toolbar "Colors" dropdown. */
export function TradeColorLegend({ trades }: { trades: string[] }) {
  const { tradeColor, isCustomTrade, setTradeColor, resetTaskColors } = useTaskColors();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Colors by trade</p>
        <button onClick={e => { e.preventDefault(); resetTaskColors(); }} className="text-[10px] font-semibold text-muted-foreground hover:text-foreground">Reset</button>
      </div>
      <div className="max-h-72 space-y-2 overflow-auto pr-0.5">
        {trades.map(trade => (
          <div key={trade} className="rounded-lg px-1 py-1 hover:bg-card/60">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-black/20" style={{ backgroundColor: tradeColor(trade) }} />
              <span className="truncate text-[11px] font-semibold">{trade}</span>
              {isCustomTrade(trade) && (
                <button onClick={e => { e.preventDefault(); setTradeColor(trade, null); }} className="ml-auto text-[9px] font-semibold text-muted-foreground hover:text-foreground">Default</button>
              )}
              <label className={cn("cursor-pointer text-[9px] font-semibold text-muted-foreground hover:text-foreground", !isCustomTrade(trade) && "ml-auto")}>
                Custom
                <input type="color" value={tradeColor(trade)} onChange={e => setTradeColor(trade, e.target.value)} className="sr-only" />
              </label>
            </div>
            <SwatchGrid value={tradeColor(trade)} onPick={c => setTradeColor(trade, c)} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Compact colour control for the task inspector bar: a labelled chip that opens
 * a popover with the trade default, palette and a custom picker.
 */
export function TaskColorChip({ taskId, trade }: { taskId: string; trade: string }) {
  const { colorFor, isCustomTask, setTaskColor, setTradeColor, tradeColor } = useTaskColors();
  const current = colorFor({ id: taskId, trade });
  const custom = isCustomTask(taskId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          title="Activity colour"
          className="flex items-center gap-1.5 rounded-full border border-border/60 px-2 py-1 text-[10px] font-semibold text-muted-foreground transition hover:bg-card/70 hover:text-foreground"
        >
          <span className="h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-black/20" style={{ backgroundColor: current }} />
          {custom ? "Custom" : trade}
          <ChevronDown size={11} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 rounded-xl p-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Activity colour</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {custom ? `Overrides the ${trade} default.` : `Inherited from the ${trade} trade default.`}
        </p>

        <div className="mt-3">
          <SwatchGrid value={current} onPick={c => setTaskColor(taskId, c)} />
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-2">
          <label className="cursor-pointer text-[10px] font-semibold text-muted-foreground hover:text-foreground">
            Custom colour…
            <input type="color" value={current || tradeColor(trade)} onChange={e => setTaskColor(taskId, e.target.value)} className="sr-only" />
          </label>
          {custom
            ? <button onClick={() => setTaskColor(taskId, null)} className="text-[10px] font-semibold text-muted-foreground hover:text-foreground">Use trade default</button>
            : <button onClick={() => setTradeColor(trade, current)} className="text-[10px] font-semibold text-muted-foreground hover:text-foreground">Apply to trade</button>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
