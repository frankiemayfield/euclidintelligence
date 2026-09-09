import { SubLayout } from "@/components/sub/SubLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Plus, Pencil, Check, Trash2, ArrowRight, GripVertical, X, Copy,
  Eye, EyeOff
} from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useDemoProject } from "@/hooks/use-demo-project";

interface LineItem {
  id: string;
  code: string;
  title: string;
  description: string;
  qty: number;
  unit: string;
  unitCost: number;
  total: number;
  category: string;
  notes: string;
}

const initialLineItems: LineItem[] = [
  { id: "1", code: "06-100", title: "Exterior wall framing", description: "Rough framing labor — exterior walls, 2×4 @ 16\" OC", qty: 1420, unit: "LF", unitCost: 3.20, total: 4544, category: "base", notes: "" },
  { id: "2", code: "06-100", title: "Bearing wall framing", description: "Rough framing labor — bearing walls, 2×6 @ 16\" OC", qty: 380, unit: "LF", unitCost: 3.80, total: 1444, category: "base", notes: "" },
  { id: "3", code: "06-110", title: "Lumber material package", description: "Lumber/material package — studs, plates, headers", qty: 1, unit: "LS", unitCost: 6800, total: 6800, category: "base", notes: "" },
  { id: "4", code: "06-120", title: "Roof truss package", description: "Truss package — pre-engineered roof trusses, 24\" OC", qty: 22, unit: "EA", unitCost: 185, total: 4070, category: "base", notes: "" },
  { id: "5", code: "06-130", title: "Wall sheathing", description: "Sheathing material — wall (7/16\" OSB), includes waste", qty: 2800, unit: "SF", unitCost: 0.65, total: 1820, category: "base", notes: "" },
  { id: "6", code: "06-130", title: "Roof sheathing", description: "Sheathing material — roof (7/16\" OSB), includes waste", qty: 1900, unit: "SF", unitCost: 0.65, total: 1235, category: "base", notes: "" },
  { id: "7", code: "06-140", title: "Hardware package", description: "Hardware — hangers, clips, straps per structural schedule", qty: 1, unit: "LS", unitCost: 1200, total: 1200, category: "base", notes: "" },
  { id: "8", code: "06-150", title: "Header installation", description: "Headers/LVL package — install labor only, sizes per schedule", qty: 18, unit: "EA", unitCost: 45, total: 810, category: "base", notes: "" },
  { id: "9", code: "06-160", title: "Blocking & nailers", description: "Blocking/nailers — cabinet, TV, handrail backing", qty: 1, unit: "LS", unitCost: 680, total: 680, category: "base", notes: "" },
  { id: "10", code: "06-170", title: "Temporary shoring", description: "Temporary shoring during demo phase — bearing wall removal", qty: 1, unit: "LS", unitCost: 1200, total: 1200, category: "base", notes: "" },
  { id: "11", code: "01-100", title: "Mobilization & setup", description: "Mobilization, equipment delivery, and staging area setup", qty: 1, unit: "LS", unitCost: 800, total: 800, category: "general", notes: "" },
  { id: "12", code: "01-200", title: "Cleanup & debris", description: "Cleanup & debris removal — framing waste hauled offsite", qty: 1, unit: "LS", unitCost: 450, total: 450, category: "general", notes: "" },
  { id: "13", code: "01-300", title: "Temp protection", description: "Temp protection — floors & finishes during framing", qty: 1, unit: "LS", unitCost: 350, total: 350, category: "general", notes: "" },
  { id: "14", code: "01-400", title: "Coordination meetings", description: "Coordination meetings (allowance) — 4 meetings with GC", qty: 4, unit: "EA", unitCost: 150, total: 600, category: "prebuild", notes: "" },
  { id: "15", code: "01-500", title: "Shop drawings review", description: "Shop drawings review (allowance) — truss and header review", qty: 1, unit: "LS", unitCost: 400, total: 400, category: "prebuild", notes: "" },
];

const fmt = (n: number) => `$${n.toLocaleString()}`;

export default function SubEstimateBuilderPage() {
  const { project, quote } = useDemoProject();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("base");
  const [items, setItems] = useState<LineItem[]>(initialLineItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<LineItem>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCostCodes, setShowCostCodes] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  useEffect(() => {
    const target = quote.currentAmount ? quote.currentAmount / 1.25 : quote.preliminaryAmount ?? 0;
    const current = initialLineItems.reduce((sum, item) => sum + item.total, 0);
    const factor = current ? target / current : 1;
    setItems(initialLineItems.map(item => ({ ...item, unitCost: Number((item.unitCost * factor).toFixed(2)), total: Math.round(item.total * factor) })));
  }, [project.id, quote.currentAmount, quote.preliminaryAmount]);

  const baseItems = items.filter(l => l.category === "base");
  const generalItems = items.filter(l => l.category === "general");
  const prebuildItems = items.filter(l => l.category === "prebuild");

  const baseTotal = baseItems.reduce((s, l) => s + l.total, 0);
  const generalTotal = generalItems.reduce((s, l) => s + l.total, 0);
  const prebuildTotal = prebuildItems.reduce((s, l) => s + l.total, 0);
  const grandTotal = baseTotal + generalTotal + prebuildTotal;

  const startEdit = (item: LineItem) => {
    setEditingId(item.id);
    setEditValues({ title: item.title, description: item.description, qty: item.qty, unit: item.unit, unitCost: item.unitCost, notes: item.notes });
  };

  const saveEdit = () => {
    if (!editingId) return;
    setItems(prev => prev.map(item => {
      if (item.id !== editingId) return item;
      const qty = editValues.qty ?? item.qty;
      const unitCost = editValues.unitCost ?? item.unitCost;
      return {
        ...item,
        title: editValues.title ?? item.title,
        description: editValues.description ?? item.description,
        qty,
        unit: editValues.unit ?? item.unit,
        unitCost,
        total: qty * unitCost,
        notes: editValues.notes ?? item.notes,
      };
    }));
    setEditingId(null);
    setEditValues({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const deleteItems = (ids: string[]) => {
    setItems(prev => prev.filter(item => !ids.includes(item.id)));
    setSelectedIds(new Set());
  };

  const duplicateItems = (ids: string[]) => {
    const newItems: LineItem[] = [];
    ids.forEach(id => {
      const source = items.find(i => i.id === id);
      if (source) {
        newItems.push({ ...source, id: `${source.id}-dup-${Date.now()}`, title: `${source.title} (copy)` });
      }
    });
    setItems(prev => [...prev, ...newItems]);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (categoryItems: LineItem[]) => {
    const allSelected = categoryItems.every(i => selectedIds.has(i.id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      categoryItems.forEach(i => { if (allSelected) next.delete(i.id); else next.add(i.id); });
      return next;
    });
  };

  // Drag reorder
  const handleDragStart = (id: string) => setDragId(id);
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverId(id); };
  const handleDrop = (targetId: string, category: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    setItems(prev => {
      const catItems = prev.filter(i => i.category === category);
      const otherItems = prev.filter(i => i.category !== category);
      const dragIdx = catItems.findIndex(i => i.id === dragId);
      const dropIdx = catItems.findIndex(i => i.id === targetId);
      if (dragIdx === -1 || dropIdx === -1) return prev;
      const moved = catItems.splice(dragIdx, 1)[0];
      catItems.splice(dropIdx, 0, moved);
      return [...otherItems, ...catItems];
    });
    setDragId(null);
    setDragOverId(null);
  };
  const handleDragEnd = () => { setDragId(null); setDragOverId(null); };

  const renderTable = (categoryItems: LineItem[], category: string) => (
    <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="w-8" />
            <th className="w-8 pl-2 py-2.5">
              <input
                type="checkbox"
                className="rounded border-border"
                checked={categoryItems.length > 0 && categoryItems.every(i => selectedIds.has(i.id))}
                onChange={() => toggleSelectAll(categoryItems)}
              />
            </th>
            {showCostCodes && <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">Code</th>}
            <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">Item</th>
            <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground w-16">Qty</th>
            <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground w-14">Unit</th>
            <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground w-24">Unit Cost</th>
            <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground w-24">Total</th>
            <th className="w-16" />
          </tr>
        </thead>
        <tbody>
          {categoryItems.map((l) => {
            const isEditing = editingId === l.id;
            return (
              <tr
                key={l.id}
                draggable={!isEditing}
                onDragStart={() => handleDragStart(l.id)}
                onDragOver={(e) => handleDragOver(e, l.id)}
                onDrop={() => handleDrop(l.id, category)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "border-b border-border last:border-0 hover:bg-muted/20 transition-colors",
                  selectedIds.has(l.id) && "bg-primary/5",
                  dragOverId === l.id && dragId !== l.id && "border-t-2 border-t-primary"
                )}
              >
                <td className="px-1 py-3 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                  <GripVertical size={14} />
                </td>
                <td className="pl-2 py-3">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    checked={selectedIds.has(l.id)}
                    onChange={() => toggleSelect(l.id)}
                  />
                </td>
                {showCostCodes && (
                  <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{l.code}</td>
                )}
                <td className="px-3 py-3">
                  {isEditing ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={editValues.title ?? ""}
                        onChange={(e) => setEditValues(v => ({ ...v, title: e.target.value }))}
                        className="w-full text-sm font-semibold bg-muted/30 border border-border rounded-lg px-2 py-1 text-foreground outline-none focus:ring-1 focus:ring-primary/30"
                        placeholder="Title"
                      />
                      <input
                        type="text"
                        value={editValues.description ?? ""}
                        onChange={(e) => setEditValues(v => ({ ...v, description: e.target.value }))}
                        className="w-full text-xs bg-muted/30 border border-border rounded-lg px-2 py-1 text-foreground outline-none focus:ring-1 focus:ring-primary/30"
                        placeholder="Description"
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-foreground">{l.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{l.description}</p>
                    </div>
                  )}
                </td>
                <td className="px-3 py-3">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editValues.qty ?? 0}
                      onChange={(e) => setEditValues(v => ({ ...v, qty: Number(e.target.value) }))}
                      className="w-full text-sm bg-muted/30 border border-border rounded-lg px-2 py-1 text-foreground outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  ) : (
                    <span className="font-display font-semibold text-foreground">{l.qty.toLocaleString()}</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editValues.unit ?? ""}
                      onChange={(e) => setEditValues(v => ({ ...v, unit: e.target.value }))}
                      className="w-14 text-xs bg-muted/30 border border-border rounded-lg px-2 py-1 text-foreground outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  ) : (
                    <span className="text-muted-foreground">{l.unit}</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editValues.unitCost ?? 0}
                      onChange={(e) => setEditValues(v => ({ ...v, unitCost: Number(e.target.value) }))}
                      className="w-full text-sm bg-muted/30 border border-border rounded-lg px-2 py-1 text-foreground outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  ) : (
                    <span className="text-muted-foreground">{fmt(l.unitCost)}</span>
                  )}
                </td>
                <td className="px-3 py-3 font-display font-semibold text-foreground">{fmt(isEditing ? (editValues.qty ?? l.qty) * (editValues.unitCost ?? l.unitCost) : l.total)}</td>
                <td className="px-3 py-3">
                  {isEditing ? (
                    <div className="flex gap-1">
                      <button onClick={saveEdit} className="text-primary hover:text-primary/80"><Check size={14} /></button>
                      <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
                      <button onClick={() => deleteItems([l.id])} className="text-destructive hover:text-destructive/80"><Trash2 size={14} /></button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(l)} className="text-muted-foreground hover:text-foreground"><Pencil size={12} /></button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-muted/30">
            <td colSpan={showCostCodes ? 7 : 6} className="px-4 py-3 text-sm font-medium text-foreground">Subtotal</td>
            <td className="px-3 py-3 font-display font-bold text-foreground">{fmt(categoryItems.reduce((s, l) => s + l.total, 0))}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );

  return (
    <SubLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Estimate Builder</h1>
             <p className="text-sm text-muted-foreground mt-1">{project.name} — Framing quote builder · {quote.currentAmount ? `$${quote.currentAmount.toLocaleString()} current quote` : "Preliminary pricing"}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{showCostCodes ? <Eye size={13} /> : <EyeOff size={13} />}</span>
              <span>Cost Codes</span>
              <Switch checked={showCostCodes} onCheckedChange={setShowCostCodes} className="scale-75" />
            </div>
            <Button size="sm" className="gap-1.5" onClick={() => navigate("/sub/pricing")}>
              Continue to Pricing <ArrowRight size={14} />
            </Button>
          </div>
        </div>

        {/* Global Command Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-primary/5 border border-primary/20 rounded-xl">
            <span className="text-xs font-semibold text-primary">{selectedIds.size} selected</span>
            <div className="flex gap-1.5 ml-auto">
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => duplicateItems(Array.from(selectedIds))}>
                <Copy size={12} className="mr-1" />Duplicate Selected
              </Button>
              <Button size="sm" variant="outline" className="text-xs h-7 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => deleteItems(Array.from(selectedIds))}>
                <Trash2 size={12} className="mr-1" />Delete Selected
              </Button>
            </div>
          </div>
        )}

        {/* Rollup */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Base Scope", value: fmt(baseTotal) },
            { label: "General Requirements", value: fmt(generalTotal) },
            { label: "Pre-Build", value: fmt(prebuildTotal) },
            { label: "Total Estimate", value: fmt(grandTotal) },
          ].map(c => (
            <div key={c.label} className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
              <p className="text-[10px] text-muted-foreground">{c.label}</p>
              <p className="font-display text-xl font-bold text-foreground mt-0.5">{c.value}</p>
            </div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="prebuild">Pre-Build Requirements</TabsTrigger>
            <TabsTrigger value="base">Base Scope</TabsTrigger>
            <TabsTrigger value="general">General Requirements</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
          </TabsList>

          <TabsContent value="prebuild">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Pre-Build Requirements</h2>
                <p className="text-xs text-muted-foreground">Coordination, shop drawings, and preconstruction items</p>
              </div>
              <Button size="sm" className="text-xs"><Plus size={13} className="mr-1.5" />Add Line</Button>
            </div>
            {renderTable(prebuildItems, "prebuild")}
          </TabsContent>

          <TabsContent value="base">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Base Scope</h2>
                <p className="text-xs text-muted-foreground">Core framing line items — labor, materials, and installation</p>
              </div>
              <Button size="sm" className="text-xs"><Plus size={13} className="mr-1.5" />Add Line</Button>
            </div>
            {renderTable(baseItems, "base")}
          </TabsContent>

          <TabsContent value="general">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">General Requirements</h2>
                <p className="text-xs text-muted-foreground">Mobilization, cleanup, staging, and site protection</p>
              </div>
              <Button size="sm" className="text-xs"><Plus size={13} className="mr-1.5" />Add Line</Button>
            </div>
            {renderTable(generalItems, "general")}
          </TabsContent>

          <TabsContent value="review">
            <div className="bg-card border border-border rounded-xl p-5 shadow-card">
              <h2 className="font-display font-semibold text-foreground mb-3">Estimate Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Pre-Build Requirements</span>
                  <span className="font-display font-semibold text-foreground">{fmt(prebuildTotal)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Base Scope (Framing)</span>
                  <span className="font-display font-semibold text-foreground">{fmt(baseTotal)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">General Requirements</span>
                  <span className="font-display font-semibold text-foreground">{fmt(generalTotal)}</span>
                </div>
                <div className="flex justify-between py-2 pt-3">
                  <span className="text-sm font-medium text-foreground">Total Estimated Cost</span>
                  <span className="font-display text-lg font-bold text-primary">{fmt(grandTotal)}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SubLayout>
  );
}
