import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";

type SelectionStatus = "Not Started" | "Under Review" | "Awaiting Client" | "Selected" | "Approved" | "Ordered";

interface SelectionItem {
  id: string; category: string; itemName: string; spec: string; vendor: string;
  allowance: number; selectedAmount: number; status: SelectionStatus; leadTime: string; notes: string;
}

const statusStyles: Record<SelectionStatus, string> = {
  "Not Started": "bg-muted text-muted-foreground",
  "Under Review": "bg-info/10 text-info",
  "Awaiting Client": "bg-warning/10 text-warning",
  "Selected": "bg-primary/10 text-primary",
  "Approved": "bg-primary/10 text-primary",
  "Ordered": "bg-accent text-accent-foreground",
};

const defaultItems: SelectionItem[] = [
  { id: "s1", category: "Flooring", itemName: "LVP - Premium Oak", spec: "Coretec Plus HD 7\"", vendor: "Floor & Decor", allowance: 12500, selectedAmount: 14200, status: "Selected", leadTime: "2 weeks", notes: "Client upgraded from standard" },
  { id: "s2", category: "Plumbing Fixtures", itemName: "Kitchen Faucet", spec: "Kohler Artifacts", vendor: "Ferguson", allowance: 1200, selectedAmount: 980, status: "Approved", leadTime: "1 week", notes: "" },
  { id: "s3", category: "Countertops", itemName: "Quartz - Calacatta", spec: "Cambria Brittanicca", vendor: "Stone Center", allowance: 5600, selectedAmount: 7200, status: "Awaiting Client", leadTime: "4 weeks", notes: "Pending final color selection" },
  { id: "s4", category: "Lighting", itemName: "Pendant Lights", spec: "TBD", vendor: "TBD", allowance: 4200, selectedAmount: 0, status: "Not Started", leadTime: "—", notes: "" },
  { id: "s5", category: "Appliances", itemName: "Samsung Package", spec: "Bespoke Series", vendor: "Best Buy Commercial", allowance: 8500, selectedAmount: 8200, status: "Ordered", leadTime: "6 weeks", notes: "Delivery confirmed" },
  { id: "s6", category: "Cabinet Hardware", itemName: "TBD", spec: "TBD", vendor: "TBD", allowance: 1200, selectedAmount: 0, status: "Not Started", leadTime: "—", notes: "" },
];

export function SelectionsSection() {
  const [items] = useState<SelectionItem[]>(defaultItems);

  const pending = items.filter(i => i.status === "Not Started" || i.status === "Awaiting Client").length;
  const overAllowance = items.filter(i => i.selectedAmount > 0 && i.selectedAmount > i.allowance);
  const underAllowance = items.filter(i => i.selectedAmount > 0 && i.selectedAmount < i.allowance);
  const totalVariance = items.reduce((s, i) => i.selectedAmount > 0 ? s + (i.selectedAmount - i.allowance) : s, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Selections</h2>
          <p className="text-xs text-muted-foreground">Client-driven product selections tied to allowances</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="text-xs"><Plus size={13} className="mr-1.5" />Add Selection</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="font-display text-lg font-bold text-warning">{pending}</p>
          <p className="text-[10px] text-muted-foreground">Pending</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="font-display text-lg font-bold text-destructive">{overAllowance.length}</p>
          <p className="text-[10px] text-muted-foreground">Over Allowance</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="font-display text-lg font-bold text-primary">{underAllowance.length}</p>
          <p className="text-[10px] text-muted-foreground">Under Allowance</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className={`font-display text-lg font-bold ${totalVariance >= 0 ? "text-warning" : "text-primary"}`}>
            {totalVariance >= 0 ? "+" : "-"}${Math.abs(totalVariance).toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground">Total Variance</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Category", "Item", "Spec", "Vendor", "Allowance", "Selected", "Variance", "Status", "Lead Time"].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const variance = item.selectedAmount > 0 ? item.selectedAmount - item.allowance : null;
                return (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{item.category}</td>
                    <td className="px-3 py-2.5 text-foreground">{item.itemName}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{item.spec}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{item.vendor}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">${item.allowance.toLocaleString()}</td>
                    <td className="px-3 py-2.5 font-display font-semibold text-foreground">
                      {item.selectedAmount > 0 ? `$${item.selectedAmount.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      {variance !== null ? (
                        <span className={`text-xs font-semibold flex items-center gap-1 ${variance > 0 ? "text-destructive" : variance < 0 ? "text-primary" : "text-muted-foreground"}`}>
                          {variance > 0 ? <TrendingUp size={11} /> : variance < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
                          {variance > 0 ? "+" : ""}${variance.toLocaleString()}
                        </span>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusStyles[item.status]}`}>{item.status}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{item.leadTime}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border bg-muted/30 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{items.length} selections</span>
          <span className={`font-display font-bold ${totalVariance >= 0 ? "text-warning" : "text-primary"}`}>
            Selections Variance: {totalVariance >= 0 ? "+" : "-"}${Math.abs(totalVariance).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
