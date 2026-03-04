import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Trash2, Eye, EyeOff, Pencil, Check, X } from "lucide-react";

interface PreBuildItem {
  id: string; item: string; description: string; category: string; qty: string; unit: string; unitCost: number; total: number;
  source: string; inProposal: boolean; billingType: "Included" | "Billed Separately" | "Precon Only"; notes: string;
}

const defaultItems: PreBuildItem[] = [
  { id: "pb1", item: "Permitting", description: "Building permit application & fees", category: "Permits", qty: "1", unit: "LS", unitCost: 3200, total: 3200, source: "Municipal fee schedule", inProposal: true, billingType: "Billed Separately", notes: "" },
  { id: "pb2", item: "Permit Expediting", description: "Third-party permit expediting service", category: "Permits", qty: "1", unit: "LS", unitCost: 1500, total: 1500, source: "Vendor quote", inProposal: true, billingType: "Billed Separately", notes: "" },
  { id: "pb3", item: "Design Fees", description: "Architectural design & documentation", category: "Design", qty: "1", unit: "LS", unitCost: 8500, total: 8500, source: "Design contract", inProposal: true, billingType: "Billed Separately", notes: "" },
  { id: "pb4", item: "Structural Engineering", description: "Structural review & calculations", category: "Engineering", qty: "1", unit: "LS", unitCost: 4200, total: 4200, source: "Engineer proposal", inProposal: true, billingType: "Included", notes: "" },
  { id: "pb5", item: "Surveying", description: "Property & boundary survey", category: "Site Investigation", qty: "1", unit: "LS", unitCost: 2800, total: 2800, source: "Surveyor quote", inProposal: true, billingType: "Billed Separately", notes: "" },
  { id: "pb6", item: "Soil / Geotech Testing", description: "Geotechnical investigation & report", category: "Site Investigation", qty: "1", unit: "LS", unitCost: 3500, total: 3500, source: "Assumption", inProposal: false, billingType: "Precon Only", notes: "Pending site access" },
  { id: "pb7", item: "HOA Submission Prep", description: "HOA architectural review package", category: "Approvals", qty: "1", unit: "LS", unitCost: 800, total: 800, source: "Internal estimate", inProposal: true, billingType: "Included", notes: "" },
  { id: "pb8", item: "Interior Design Coordination", description: "Interior design consultation & selections coordination", category: "Design", qty: "20", unit: "HR", unitCost: 150, total: 3000, source: "Design contract", inProposal: true, billingType: "Billed Separately", notes: "" },
  { id: "pb9", item: "Preconstruction Meetings", description: "Kickoff, planning, and coordination meetings", category: "Planning", qty: "4", unit: "EA", unitCost: 450, total: 1800, source: "Internal rate", inProposal: false, billingType: "Precon Only", notes: "" },
  { id: "pb10", item: "Demo Planning", description: "Demolition scope assessment & planning", category: "Planning", qty: "1", unit: "LS", unitCost: 1200, total: 1200, source: "Internal estimate", inProposal: false, billingType: "Precon Only", notes: "" },
];

const billingStyles: Record<string, string> = {
  "Included": "bg-primary/10 text-primary",
  "Billed Separately": "bg-info/10 text-info",
  "Precon Only": "bg-muted text-muted-foreground",
};

export function PreBuildRequirementsSection() {
  const [items, setItems] = useState<PreBuildItem[]>(defaultItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<PreBuildItem>>({});

  const total = items.reduce((s, i) => s + i.total, 0);
  const clientFacing = items.filter(i => i.inProposal).length;
  const preconOnly = items.filter(i => i.billingType === "Precon Only").length;

  const toggleProposal = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, inProposal: !i.inProposal } : i));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const startEdit = (item: PreBuildItem) => {
    setEditingId(item.id);
    setEditValues({ ...item });
  };

  const saveEdit = () => {
    if (!editingId) return;
    setItems(items.map(i => i.id === editingId ? { ...i, ...editValues, total: Number(editValues.qty || i.qty) * (editValues.unitCost ?? i.unitCost) || editValues.total || i.total } : i));
    setEditingId(null);
    setEditValues({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Pre-Build Requirements</h2>
          <p className="text-xs text-muted-foreground">Preconstruction, permitting, design, engineering, and setup costs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs"><FileText size={13} className="mr-1.5" />Insert Template</Button>
          <Button size="sm" className="text-xs"><Plus size={13} className="mr-1.5" />Add Item</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="font-display text-lg font-bold text-foreground">{items.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Items</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="font-display text-lg font-bold text-primary">{clientFacing}</p>
          <p className="text-[10px] text-muted-foreground">Client-Facing</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="font-display text-lg font-bold text-muted-foreground">{preconOnly}</p>
          <p className="text-[10px] text-muted-foreground">Precon Only</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="font-display text-lg font-bold text-primary">${total.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Pre-Build Total</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Item", "Description", "Category", "Qty", "Unit", "Unit Cost", "Total", "Billing", "Source", "Proposal", ""].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const isEditing = editingId === item.id;
                return (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">
                      {isEditing ? <input value={editValues.item ?? ""} onChange={e => setEditValues({...editValues, item: e.target.value})} className="w-full bg-background border border-border rounded px-1.5 py-0.5 text-xs outline-none focus:ring-1 focus:ring-ring" /> : item.item}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground text-xs">
                      {isEditing ? <input value={editValues.description ?? ""} onChange={e => setEditValues({...editValues, description: e.target.value})} className="w-full bg-background border border-border rounded px-1.5 py-0.5 text-xs outline-none focus:ring-1 focus:ring-ring" /> : item.description}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground text-xs">{item.category}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {isEditing ? <input value={editValues.qty ?? ""} onChange={e => setEditValues({...editValues, qty: e.target.value})} className="w-16 bg-background border border-border rounded px-1.5 py-0.5 text-xs outline-none focus:ring-1 focus:ring-ring" /> : item.qty}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{item.unit}</td>
                    <td className="px-3 py-2.5 text-foreground">
                      {isEditing ? <input type="number" value={editValues.unitCost ?? 0} onChange={e => setEditValues({...editValues, unitCost: Number(e.target.value)})} className="w-20 bg-background border border-border rounded px-1.5 py-0.5 text-xs outline-none focus:ring-1 focus:ring-ring" /> : `$${item.unitCost.toLocaleString()}`}
                    </td>
                    <td className="px-3 py-2.5 font-display font-semibold text-foreground">${item.total.toLocaleString()}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${billingStyles[item.billingType]}`}>{item.billingType}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{item.source}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => toggleProposal(item.id)} className="text-muted-foreground hover:text-foreground">
                        {item.inProposal ? <Eye size={14} className="text-primary" /> : <EyeOff size={14} />}
                      </button>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <button onClick={saveEdit} className="text-primary hover:text-primary/80"><Check size={13} /></button>
                            <button onClick={cancelEdit} className="text-muted-foreground hover:text-destructive"><X size={13} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(item)} className="text-muted-foreground hover:text-foreground"><Pencil size={13} /></button>
                            <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={13} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border bg-muted/30 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{items.length} items</span>
          <span className="font-display font-bold text-foreground">Pre-Build Requirements Total: ${total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
