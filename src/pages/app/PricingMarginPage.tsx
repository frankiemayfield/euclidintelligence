import { AppLayout } from "@/components/app/AppLayout";
import { useState } from "react";
import { AlertTriangle, ArrowRight, Check, DollarSign, Percent, TrendingUp, Eye, EyeOff, Send, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WorkflowTransition } from "@/components/app/WorkflowTransition";

type PricingMode = "Cost Plus" | "Fixed Fee" | "Lump Sum" | "GMP";
type FeePresentation = "shown separately" | "included in total" | "internal only";
type ContingencyVisibility = "visible to client" | "hidden internally" | "rolled into total";
type ClientView = "Detailed" | "Grouped" | "Lump Sum" | "Owner Summary";

const fmt = (n: number) => `$${n.toLocaleString()}`;
const pct = (n: number) => `${n.toFixed(1)}%`;

// Base cost data from Estimate Builder
const costCategories = [
  { name: "Labor", base: 65280, markupEnabled: true },
  { name: "Materials", base: 46520, markupEnabled: true },
  { name: "Subcontractors", base: 35300, markupEnabled: true },
  { name: "Equipment", base: 4800, markupEnabled: true },
  { name: "General Conditions", base: 8200, markupEnabled: true },
  { name: "Allowances", base: 6500, markupEnabled: false },
  { name: "Other", base: 2100, markupEnabled: true },
];

const baseCost = costCategories.reduce((s, c) => s + c.base, 0);

export default function PricingMarginPage() {
  const [marketTransition, setMarketTransition] = useState(false);
  const [pricingMode, setPricingMode] = useState<PricingMode>("Cost Plus");
  const [overhead, setOverhead] = useState(8);
  const [profit, setProfit] = useState(10);
  const [contingency, setContingency] = useState(5);
  const [contingencyIsDollar, setContingencyIsDollar] = useState(false);
  const [taxRate, setTaxRate] = useState(7.5);
  const [taxMode, setTaxMode] = useState<"included" | "excluded" | "materials only" | "shown separately">("shown separately");
  const [fixedFee, setFixedFee] = useState(22000);
  const [gmpCeiling, setGmpCeiling] = useState(210000);
  const [feePresentation, setFeePresentation] = useState<FeePresentation>("shown separately");
  const [contingencyVisibility, setContingencyVisibility] = useState<ContingencyVisibility>("visible to client");
  const [clientView, setClientView] = useState<ClientView>("Detailed");
  const [categoryMarkup, setCategoryMarkup] = useState<Record<string, number>>(
    Object.fromEntries(costCategories.map(c => [c.name, c.markupEnabled ? overhead + profit : 0]))
  );
  const [targetMargin, setTargetMargin] = useState(18);

  // Calculations
  const effectiveMarkup = overhead + profit;
  const contingencyAmt = contingencyIsDollar ? contingency : baseCost * (contingency / 100);
  const totalMarkup = costCategories.reduce((s, c) => s + c.base * ((categoryMarkup[c.name] || 0) / 100), 0);
  const sellPriceBeforeTax = baseCost + totalMarkup + contingencyAmt + (pricingMode === "Fixed Fee" ? fixedFee : 0);

  const taxableBase = taxMode === "materials only" ? costCategories.find(c => c.name === "Materials")!.base : (taxMode === "included" ? 0 : sellPriceBeforeTax);
  const taxAmount = taxMode === "included" ? 0 : taxableBase * (taxRate / 100);
  const clientTotal = sellPriceBeforeTax + taxAmount;

  const grossProfit = sellPriceBeforeTax - baseCost;
  const grossMargin = (grossProfit / sellPriceBeforeTax) * 100;

  const targetSellPrice = baseCost / (1 - targetMargin / 100);
  const targetMarkupNeeded = ((targetSellPrice - baseCost) / baseCost) * 100;

  const marginWarning = grossMargin < targetMargin;
  const lowContingency = contingencyAmt / baseCost < 0.03;

  // Scenario data
  const scenarios: { mode: PricingMode; sellPrice: number; gp: number; gm: number; contingencyNote: string; feeNote: string; clientNote: string; risk: string }[] = [
    { mode: "Cost Plus", sellPrice: baseCost * 1.18 + contingencyAmt, gp: baseCost * 0.18, gm: 15.3, contingencyNote: "Passed through", feeNote: `${overhead + profit}% markup on cost`, clientNote: "Open-book, variable final cost", risk: "Low risk — owner absorbs overruns" },
    { mode: "Fixed Fee", sellPrice: baseCost + fixedFee + contingencyAmt, gp: fixedFee, gm: (fixedFee / (baseCost + fixedFee)) * 100, contingencyNote: "Separate from fee", feeNote: fmt(fixedFee) + " flat fee", clientNote: "Stable fee, clearer owner expectation", risk: "Medium — fee fixed, cost variable" },
    { mode: "Lump Sum", sellPrice: baseCost * 1.22 + contingencyAmt, gp: baseCost * 0.22, gm: 18.0, contingencyNote: "Buried in total", feeNote: "22% markup included", clientNote: "One number — simplest presentation", risk: "High — contractor carries all risk" },
    { mode: "GMP", sellPrice: gmpCeiling, gp: gmpCeiling - baseCost - contingencyAmt, gm: ((gmpCeiling - baseCost - contingencyAmt) / gmpCeiling) * 100, contingencyNote: "Within ceiling", feeNote: "Markup capped at GMP", clientNote: "Capped cost with shared savings", risk: "Moderate — capped upside" },
  ];

  const updateCategoryMarkup = (name: string, val: number) => {
    setCategoryMarkup(prev => ({ ...prev, [name]: val }));
  };

  const applyGlobalMarkup = () => {
    setCategoryMarkup(Object.fromEntries(costCategories.map(c => [c.name, c.markupEnabled ? effectiveMarkup : 0])));
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Pricing & Margin</h1>
            <p className="text-sm text-muted-foreground mt-1">Maple St. Kitchen Remodel — Turn estimated cost into sell price</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Save Strategy</Button>
            <Button variant="outline" size="sm"><Send size={14} className="mr-1.5" />Send to Proposal Export</Button>
            <Button size="sm" className="gap-1.5" onClick={() => setMarketTransition(true)}>
              <BarChart3 size={14} />
              Compare Against Market
            </Button>
          </div>
        </div>

        {/* Source Context */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Line Items", value: "10" },
            { label: "Internal Cost", value: fmt(baseCost) },
            { label: "Sub-Sourced Items", value: "4" },
            { label: "Manual Overrides", value: "2" },
            { label: "Pricing Mode", value: pricingMode },
          ].map(c => (
            <div key={c.label} className="bg-card border border-border rounded-xl p-3 shadow-card text-center">
              <p className="text-[10px] text-muted-foreground">{c.label}</p>
              <p className="font-display text-sm font-bold text-foreground mt-0.5">{c.value}</p>
            </div>
          ))}
        </div>

        {/* === PRICING STRATEGY CONTROLS === */}
        <div className="bg-card border border-border rounded-xl shadow-card p-5 mb-6">
          <h2 className="font-display font-semibold text-foreground mb-4">Pricing Strategy</h2>

          {/* Mode Selector */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {(["Cost Plus", "Fixed Fee", "Lump Sum", "GMP"] as PricingMode[]).map(m => (
              <button key={m} onClick={() => setPricingMode(m)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pricingMode === m ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted/30 text-muted-foreground hover:text-foreground border border-transparent"}`}>
                {m}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Core Controls */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Overhead %</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={25} value={overhead} onChange={e => setOverhead(+e.target.value)} className="flex-1 accent-primary" />
                  <span className="text-sm font-display font-bold text-foreground w-10 text-right">{overhead}%</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Profit %</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={30} value={profit} onChange={e => setProfit(+e.target.value)} className="flex-1 accent-primary" />
                  <span className="text-sm font-display font-bold text-foreground w-10 text-right">{profit}%</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block flex items-center gap-2">
                  Contingency
                  <button onClick={() => setContingencyIsDollar(!contingencyIsDollar)} className="text-[10px] text-primary underline">{contingencyIsDollar ? "Switch to %" : "Switch to $"}</button>
                </label>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={contingencyIsDollar ? 30000 : 15} step={contingencyIsDollar ? 500 : 0.5} value={contingency} onChange={e => setContingency(+e.target.value)} className="flex-1 accent-primary" />
                  <span className="text-sm font-display font-bold text-foreground w-16 text-right">{contingencyIsDollar ? fmt(contingency) : `${contingency}%`}</span>
                </div>
              </div>
            </div>

            {/* Tax & Fee */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Tax Rate</label>
                <input type="number" value={taxRate} onChange={e => setTaxRate(+e.target.value)} step={0.1} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Tax Treatment</label>
                <select value={taxMode} onChange={e => setTaxMode(e.target.value as any)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
                  <option value="shown separately">Shown separately</option>
                  <option value="included">Included in total</option>
                  <option value="materials only">Materials only</option>
                  <option value="excluded">Excluded</option>
                </select>
              </div>
              {(pricingMode === "Fixed Fee" || pricingMode === "Cost Plus") && (
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">{pricingMode === "Fixed Fee" ? "Fixed Fee" : "Fee Amount"}</label>
                  <input type="number" value={fixedFee} onChange={e => setFixedFee(+e.target.value)} step={500} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
                </div>
              )}
              {pricingMode === "GMP" && (
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">GMP Ceiling</label>
                  <input type="number" value={gmpCeiling} onChange={e => setGmpCeiling(+e.target.value)} step={1000} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
                </div>
              )}
            </div>

            {/* Presentation */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Fee Presentation</label>
                <select value={feePresentation} onChange={e => setFeePresentation(e.target.value as FeePresentation)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
                  <option value="shown separately">Shown separately</option>
                  <option value="included in total">Included in total</option>
                  <option value="internal only">Internal only</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Contingency Visibility</label>
                <select value={contingencyVisibility} onChange={e => setContingencyVisibility(e.target.value as ContingencyVisibility)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
                  <option value="visible to client">Visible to client</option>
                  <option value="hidden internally">Hidden internally</option>
                  <option value="rolled into total">Rolled into total</option>
                </select>
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={applyGlobalMarkup}>
                Apply {effectiveMarkup}% to All Categories
              </Button>
            </div>
          </div>
        </div>

        {/* === LIVE MARGIN SUMMARY === */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Estimated Cost", value: fmt(baseCost), color: "text-foreground" },
            { label: "Sell Price", value: fmt(Math.round(sellPriceBeforeTax)), color: "text-primary" },
            { label: "Gross Profit", value: fmt(Math.round(grossProfit)), color: grossProfit > 0 ? "text-primary" : "text-destructive" },
            { label: "Gross Margin", value: pct(grossMargin), color: marginWarning ? "text-warning" : "text-primary" },
            { label: "Markup", value: pct(effectiveMarkup), color: "text-foreground" },
            { label: "Contingency", value: fmt(Math.round(contingencyAmt)), color: lowContingency ? "text-warning" : "text-foreground" },
            { label: "Tax", value: fmt(Math.round(taxAmount)), color: "text-muted-foreground" },
            { label: "Client Total", value: fmt(Math.round(clientTotal)), color: "text-foreground" },
          ].map(c => (
            <div key={c.label} className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
              <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
              <p className={`font-display text-xl font-bold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Warnings */}
        {(marginWarning || lowContingency) && (
          <div className="space-y-2 mb-6">
            {marginWarning && (
              <div className="flex items-center gap-2 bg-warning/10 border border-warning/20 rounded-lg px-4 py-2.5">
                <AlertTriangle size={14} className="text-warning shrink-0" />
                <p className="text-xs text-warning">Gross margin ({pct(grossMargin)}) is below company target ({targetMargin}%). Consider adjusting markup or contingency.</p>
              </div>
            )}
            {lowContingency && (
              <div className="flex items-center gap-2 bg-warning/10 border border-warning/20 rounded-lg px-4 py-2.5">
                <AlertTriangle size={14} className="text-warning shrink-0" />
                <p className="text-xs text-warning">Contingency ({fmt(Math.round(contingencyAmt))}) is below 3% of estimated cost. Consider increasing for risk coverage.</p>
              </div>
            )}
          </div>
        )}

        {/* === MARKUP BREAKDOWN === */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-foreground">Markup Breakdown by Category</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Control markup per cost category</p>
            </div>
            <div className="text-xs text-muted-foreground">Overhead: {overhead}% + Profit: {profit}% = {effectiveMarkup}% combined</div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Category", "Base Cost", "Markup %", "Loaded Cost", "Margin Impact"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {costCategories.map(c => {
                const mu = categoryMarkup[c.name] || 0;
                const loaded = c.base * (1 + mu / 100);
                const impact = (c.base * (mu / 100)) / sellPriceBeforeTax * 100;
                return (
                  <tr key={c.name} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmt(c.base)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input type="range" min={0} max={30} value={mu} onChange={e => updateCategoryMarkup(c.name, +e.target.value)} className="w-20 accent-primary" />
                        <span className="text-xs font-display font-bold text-foreground w-8">{mu}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-display font-semibold text-foreground">{fmt(Math.round(loaded))}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{impact.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground">Total</td>
                <td className="px-4 py-3 font-display font-semibold text-foreground">{fmt(baseCost)}</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 font-display font-bold text-primary">{fmt(Math.round(baseCost + totalMarkup))}</td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* === SCENARIO COMPARISON === */}
        <div className="bg-card border border-border rounded-xl shadow-card p-5 mb-6">
          <h2 className="font-display font-semibold text-foreground mb-1">Scenario Comparison</h2>
          <p className="text-xs text-muted-foreground mb-4">Compare pricing strategies side by side</p>
          <div className="grid md:grid-cols-4 gap-3">
            {scenarios.map(s => (
              <div key={s.mode} className={`border rounded-xl p-4 transition-colors ${pricingMode === s.mode ? "border-primary bg-primary/5" : "border-border"}`}>
                <h3 className="font-display font-semibold text-foreground text-sm mb-3">{s.mode}</h3>
                <div className="space-y-2 text-xs mb-4">
                  <div className="flex justify-between"><span className="text-muted-foreground">Sell Price</span><span className="font-display font-bold text-foreground">{fmt(Math.round(s.sellPrice))}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Gross Profit</span><span className="font-display font-bold text-primary">{fmt(Math.round(s.gp))}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Gross Margin</span><span className={`font-display font-bold ${s.gm < targetMargin ? "text-warning" : "text-primary"}`}>{s.gm.toFixed(1)}%</span></div>
                  <div className="pt-2 border-t border-border space-y-1">
                    <p className="text-muted-foreground"><span className="text-foreground font-medium">Contingency:</span> {s.contingencyNote}</p>
                    <p className="text-muted-foreground"><span className="text-foreground font-medium">Fee:</span> {s.feeNote}</p>
                    <p className="text-muted-foreground"><span className="text-foreground font-medium">Client:</span> {s.clientNote}</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic mb-3">{s.risk}</p>
                {pricingMode === s.mode ? (
                  <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium flex items-center gap-1 w-fit"><Check size={10} /> Active</span>
                ) : (
                  <Button variant="outline" size="sm" className="text-xs w-full" onClick={() => setPricingMode(s.mode)}>Use This Strategy</Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* === TARGET MARGIN CALCULATOR === */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-card border border-border rounded-xl shadow-card p-5">
            <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-primary" /> Target Margin Calculator</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Desired Gross Margin %</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={5} max={35} value={targetMargin} onChange={e => setTargetMargin(+e.target.value)} className="flex-1 accent-primary" />
                  <span className="text-sm font-display font-bold text-foreground w-10 text-right">{targetMargin}%</span>
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Required Sell Price</span><span className="font-display font-bold text-foreground">{fmt(Math.round(targetSellPrice))}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Required Markup</span><span className="font-display font-bold text-foreground">{pct(targetMarkupNeeded)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Current Gap</span>
                  <span className={`font-display font-bold ${grossMargin >= targetMargin ? "text-primary" : "text-warning"}`}>
                    {grossMargin >= targetMargin ? "On target" : `-${pct(targetMargin - grossMargin)} below`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contingency Summary */}
          <div className="bg-card border border-border rounded-xl shadow-card p-5">
            <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2"><DollarSign size={16} className="text-primary" /> Contingency Summary</h3>
            <div className="bg-muted/30 rounded-lg p-3 space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Contingency Amount</span><span className="font-display font-bold text-foreground">{fmt(Math.round(contingencyAmt))}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">% of Cost</span><span className="font-display font-bold text-foreground">{pct(contingencyAmt / baseCost * 100)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Visibility</span><span className="text-foreground font-medium">{contingencyVisibility}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="text-foreground font-medium">{contingencyIsDollar ? "Fixed dollar" : "Percentage"}</span></div>
            </div>
            {lowContingency && <p className="text-[10px] text-warning mt-2 flex items-center gap-1"><AlertTriangle size={10} /> Below recommended 3% threshold</p>}
          </div>
        </div>

        {/* === CLIENT PRICING PREVIEW === */}
        <div className="bg-card border border-border rounded-xl shadow-card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold text-foreground">Client Pricing Preview</h2>
              <p className="text-xs text-muted-foreground mt-0.5">How the client will see the proposal</p>
            </div>
            <div className="flex gap-1.5">
              {(["Detailed", "Grouped", "Lump Sum", "Owner Summary"] as ClientView[]).map(v => (
                <button key={v} onClick={() => setClientView(v)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${clientView === v ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-muted/20 border border-border rounded-lg p-4">
            {clientView === "Detailed" && (
              <table className="w-full text-xs">
                <thead><tr className="border-b border-border">
                  {["Item", "Amount"].map(h => <th key={h} className="text-left py-2 text-muted-foreground font-medium">{h}</th>)}
                </tr></thead>
                <tbody>
                  {costCategories.map(c => (
                    <tr key={c.name} className="border-b border-border/50">
                      <td className="py-2 text-foreground">{c.name}</td>
                      <td className="py-2 text-foreground font-display">{fmt(Math.round(c.base * (1 + (categoryMarkup[c.name] || 0) / 100)))}</td>
                    </tr>
                  ))}
                  {contingencyVisibility === "visible to client" && <tr className="border-b border-border/50"><td className="py-2 text-foreground">Contingency</td><td className="py-2 text-foreground font-display">{fmt(Math.round(contingencyAmt))}</td></tr>}
                  {feePresentation === "shown separately" && pricingMode === "Fixed Fee" && <tr className="border-b border-border/50"><td className="py-2 text-foreground">Contractor Fee</td><td className="py-2 text-foreground font-display">{fmt(fixedFee)}</td></tr>}
                  {taxMode === "shown separately" && <tr className="border-b border-border/50"><td className="py-2 text-foreground">Tax ({taxRate}%)</td><td className="py-2 text-foreground font-display">{fmt(Math.round(taxAmount))}</td></tr>}
                  <tr className="font-bold"><td className="py-2 text-foreground">Total</td><td className="py-2 text-primary font-display">{fmt(Math.round(clientTotal))}</td></tr>
                </tbody>
              </table>
            )}
            {clientView === "Grouped" && (
              <table className="w-full text-xs">
                <thead><tr className="border-b border-border"><th className="text-left py-2 text-muted-foreground font-medium">Category</th><th className="text-left py-2 text-muted-foreground font-medium">Amount</th></tr></thead>
                <tbody>
                  <tr className="border-b border-border/50"><td className="py-2 text-foreground">Site & Foundation</td><td className="py-2 font-display text-foreground">{fmt(Math.round((costCategories[0].base + costCategories[3].base) * 1.18))}</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2 text-foreground">Structure & Shell</td><td className="py-2 font-display text-foreground">{fmt(Math.round(costCategories[1].base * 1.18))}</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2 text-foreground">MEP Systems</td><td className="py-2 font-display text-foreground">{fmt(Math.round(costCategories[2].base * 1.18))}</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2 text-foreground">Finishes & Allowances</td><td className="py-2 font-display text-foreground">{fmt(Math.round((costCategories[4].base + costCategories[5].base) * 1.1))}</td></tr>
                  {contingencyVisibility === "visible to client" && <tr className="border-b border-border/50"><td className="py-2 text-foreground">Contingency</td><td className="py-2 font-display text-foreground">{fmt(Math.round(contingencyAmt))}</td></tr>}
                  {taxMode === "shown separately" && <tr className="border-b border-border/50"><td className="py-2 text-foreground">Tax</td><td className="py-2 font-display text-foreground">{fmt(Math.round(taxAmount))}</td></tr>}
                  <tr className="font-bold"><td className="py-2 text-foreground">Total</td><td className="py-2 text-primary font-display">{fmt(Math.round(clientTotal))}</td></tr>
                </tbody>
              </table>
            )}
            {clientView === "Lump Sum" && (
              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground mb-1">Lump Sum Proposal Total</p>
                <p className="font-display text-4xl font-bold text-primary">{fmt(Math.round(clientTotal))}</p>
                <p className="text-xs text-muted-foreground mt-2">Maple St. Kitchen Remodel — All work per plans and specifications</p>
              </div>
            )}
            {clientView === "Owner Summary" && (
              <div className="space-y-3 py-2">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Construction Cost</span><span className="text-foreground font-display font-semibold">{fmt(Math.round(baseCost + totalMarkup))}</span></div>
                {contingencyVisibility === "visible to client" && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Contingency Allowance</span><span className="text-foreground font-display font-semibold">{fmt(Math.round(contingencyAmt))}</span></div>}
                {feePresentation === "shown separately" && pricingMode === "Fixed Fee" && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Contractor Fee</span><span className="text-foreground font-display font-semibold">{fmt(fixedFee)}</span></div>}
                {taxMode === "shown separately" && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Applicable Tax</span><span className="text-foreground font-display font-semibold">{fmt(Math.round(taxAmount))}</span></div>}
                <div className="border-t border-border pt-2 flex justify-between text-sm"><span className="font-semibold text-foreground">Total Project Cost</span><span className="font-display font-bold text-primary">{fmt(Math.round(clientTotal))}</span></div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
            {feePresentation === "internal only" && <span className="flex items-center gap-1"><EyeOff size={10} /> Fee hidden from client</span>}
            {contingencyVisibility === "hidden internally" && <span className="flex items-center gap-1"><EyeOff size={10} /> Contingency hidden from client</span>}
            {contingencyVisibility === "rolled into total" && <span className="flex items-center gap-1"><Eye size={10} /> Contingency rolled into line items</span>}
          </div>
        </div>

        {/* Bottom CTAs */}
        <div className="flex gap-3">
          <Button size="sm"><Send size={14} className="mr-1.5" />Send to Proposal Export</Button>
          <Button variant="outline" size="sm"><ArrowRight size={14} className="mr-1.5" />View in Proposal Comparison</Button>
        </div>
      </div>

      <WorkflowTransition
        active={marketTransition}
        headline="Comparing your pricing"
        steps={[
          { label: "Benchmark alignment analysis" },
          { label: "Comparing against thousands of estimates" },
          { label: "Analyzing market pricing" },
          { label: "Comparing costs and prices" },
          { label: "Generating proposal score" },
        ]}
        targetPath="/app/estimate-comparison"
        onComplete={() => setMarketTransition(false)}
      />
    </AppLayout>
  );
}
