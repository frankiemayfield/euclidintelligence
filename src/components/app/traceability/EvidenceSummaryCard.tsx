interface EvidenceItem {
  label: string;
  value: string | number;
  color?: string;
}

export function EvidenceSummaryCard({ title, items }: { title: string; items: EvidenceItem[] }) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-card p-5">
      <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <p className={`font-display text-lg font-bold ${item.color || "text-foreground"}`}>{item.value}</p>
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
