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

/** Per-activity color override shown in the task drawer. */
export function TaskColorPicker({ taskId, trade }: { taskId: string; trade: string }) {
  const { colorFor, isCustomTask, setTaskColor, tradeColor } = useTaskColors();
  const current = colorFor({ id: taskId, trade });
  return (
    <div className="rounded-xl border border-border/50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase text-muted-foreground">Activity color</p>
        {isCustomTask(taskId)
          ? <button onClick={() => setTaskColor(taskId, null)} className="text-[10px] font-semibold text-muted-foreground hover:text-foreground">Use trade default</button>
          : <span className="text-[10px] text-muted-foreground">Default — {trade}</span>}
      </div>
      <div className="flex items-center gap-2">
        <span className="h-4 w-4 shrink-0 rounded-full ring-1 ring-inset ring-black/20" style={{ backgroundColor: current }} />
        <SwatchGrid value={current} onPick={c => setTaskColor(taskId, c)} />
        <label className="ml-auto cursor-pointer text-[10px] font-semibold text-muted-foreground hover:text-foreground">
          Custom
          <input type="color" value={current || tradeColor(trade)} onChange={e => setTaskColor(taskId, e.target.value)} className="sr-only" />
        </label>
      </div>
    </div>
  );
}
