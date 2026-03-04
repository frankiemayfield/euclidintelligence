import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Eye, EyeOff, AlertTriangle } from "lucide-react";

type AllowanceStatus = "Budget Placeholder" | "Needs Selection" | "Client Approved" | "Revised" | "Converted to Actual";

interface AllowanceItem {
  id: string; name: string; description: string; trade: string; amount: number;
  basis: string; clientFacing: boolean; status: AllowanceStatus; notes: string;
}

const statusStyles: Record<AllowanceStatus, string> = {
  "Budget Placeholder": "bg-muted text-muted-foreground",
  "Needs Selection": "bg-warning/10 text-warning",
  "Client Approved": "bg-primary/10 text-primary",
  "Revised": "bg-info/10 text-info",
  "Converted to Actual": "bg-accent text-accent-foreground",
};

const defaultItems: AllowanceItem[] = [
  { id: "a1", name: "Flooring Allowance", description: "All hard surface flooring - main level", trade: "Flooring", amount: 12500, basis: "Mid-range LVP @ $7.50/SF", clientFacing: true, status: "Needs Selection", notes: "" },
  { id: "a2", name: "Plumbing Fixtures", description: "Kitchen & bath fixtures", trade: "Plumbing", amount: 6800, basis: "Mid-grade fixture package", clientFacing: true, status: "Needs Selection", notes: "" },
  { id: "a3", name: "Lighting Package", description: "Interior light fixtures", trade: "Electrical", amount: 4200, basis: "Builder-grade allowance", clientFacing: true, status: "Budget Placeholder", notes: "" },
  { id: "a4", name: "Appliance Package", description: "Kitchen appliances", trade: "Specialties", amount: 8500, basis: "Mid-range stainless package", clientFacing: true, status: "Client Approved", notes: "Client selected Samsung package" },
  { id: "a5", name: "Countertops", description: "Kitchen & bath counters", trade: "Finish", amount: 5600, basis: "Quartz @ $65/SF installed", clientFacing: true, status: "Needs Selection", notes: "" },
  { id: "a6", name: "Cabinet Hardware", description: "Pulls, knobs, hinges", trade: "Finish", amount: 1200, basis: "Mid-range hardware", clientFacing: true, status: "Budget Placeholder", notes: "" },
];

export function AllowancesSection() {
  const [items, setItems] = useState<AllowanceItem[]>(defaultItems);

  const total = items.reduce((s, i) => s + i.amount, 0);
  const needsSelection = items.filter(i => i.status === "Needs Selection").length;
  const placeholders = items.filter(i => i.status === "Budget Placeholder").length;

  const toggleClient = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, clientFacing: !i.clientFacing } : i));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Allowances</h2>
          <p className="text-xs text-muted-foreground">Provisional budget placeholders and client-selection items</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs"><FileText size={13} className="mr-1.5" />Standard Allowances</Button>
          <Button size="sm" className="text-xs"><Plus size={13} className="mr-1.5" />Add Allowance</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="font-display text-lg font-bold text-foreground">{items.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Allowances</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="font-display text-lg font-bold text-warning">{needsSelection}</p>
          <p className="text-[10px] text-muted-foreground">Needs Selection</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="font-display text-lg font-bold text-muted-foreground">{placeholders}</p>
          <p className="text-[10px] text-muted-foreground">Budget Placeholders</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="font-display text-lg font-bold text-primary">${total.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Allowance Total</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Allowance", "Description", "Trade", "Amount", "Basis", "Status", "Client"].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{item.name}</td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{item.description}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{item.trade}</td>
                  <td className="px-3 py-2.5 font-display font-semibold text-foreground">${item.amount.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{item.basis}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusStyles[item.status]}`}>{item.status}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => toggleClient(item.id)} className="text-muted-foreground hover:text-foreground">
                      {item.clientFacing ? <Eye size={14} className="text-primary" /> : <EyeOff size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border bg-muted/30 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-warning">
            {needsSelection > 0 && <><AlertTriangle size={12} /><span>{needsSelection} allowances awaiting client selection</span></>}
          </div>
          <span className="font-display font-bold text-foreground">Allowance Total: ${total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
