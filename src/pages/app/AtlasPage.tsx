import { AppLayout } from "@/components/app/AppLayout";
import { Bot, Send, FileText, Sparkles, BarChart3, AlertTriangle, Ruler } from "lucide-react";
import { useState, useEffect } from "react";

type Message = { role: "atlas" | "user"; content: string; references?: { label: string; type: string }[] };

const initialMessages: Message[] = [
  {
    role: "atlas",
    content: "I've loaded the Maple St. Kitchen Remodel project. I can see 4 uploaded documents, 10 takeoff items, and 10 estimate line items. 4 items need review and 2 have low confidence. How can I help?",
  },
];

const suggestions = [
  "Show me how the concrete quantity was calculated",
  "Which line items were derived from scale?",
  "Why is this estimate most exposed?",
  "What assumptions are driving the HVAC cost?",
  "Draft exclusions for uncertain quantities",
  "Which items still need estimator confirmation?",
];

const contextItems = [
  { label: "Current Project", value: "Maple St. Kitchen Remodel", icon: FileText },
  { label: "Files Loaded", value: "4 documents", icon: FileText },
  { label: "Takeoff Items", value: "10 items", icon: Ruler },
  { label: "Estimate Lines", value: "10 items", icon: BarChart3 },
  { label: "Low Confidence", value: "2 items", icon: AlertTriangle },
  { label: "Needs Review", value: "4 items", icon: AlertTriangle },
];

export default function AtlasPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  useEffect(() => {
    document.title = "Euclid — Construction Estimating Intelligence";
    return () => { document.title = "Euclid — Construction Estimating Intelligence"; };
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages([...messages, userMsg]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "atlas",
          content:
            "Based on your current estimate, the highest exposure area is the HVAC package. The $14,200 allowance doesn't break out ductwork separately, and for a 2,800 SF addition in the Midwest region, I'd expect ductwork to run $6,400–$8,100 on its own. This quantity was derived using an assumption-based method, not from an explicit plan callout — which is why it's flagged as Low Confidence. I'd recommend splitting that line item and getting a dedicated ductwork sub quote.",
          references: [
            { label: "HVAC System — Div 23", type: "Line Item" },
            { label: "Sheet M1.1", type: "Plan Reference" },
            { label: "Confidence: Low", type: "Flag" },
          ],
        },
      ]);
    }, 1200);
  };

  const handleSuggestion = (s: string) => {
    setInput(s);
  };

  return (
    <AppLayout>
      <div className="flex h-full">
        {/* Main Chat */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-foreground">Euclid</h1>
              <p className="text-xs text-muted-foreground">Explains the work — traces every number back to its source</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "atlas" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={16} className="text-primary" />
                  </div>
                )}
                <div className={`max-w-lg`}>
                  <div
                    className={`rounded-xl p-4 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary/10 text-foreground rounded-tr-sm"
                        : "bg-muted/50 text-foreground rounded-tl-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                  {m.references && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.references.map((ref, j) => (
                        <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                          {ref.type}: {ref.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-border">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="text-xs bg-accent rounded-full px-3 py-1.5 text-accent-foreground hover:bg-primary/10 transition-colors"
                >
                  <Sparkles size={10} className="inline mr-1" />{s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3">
              <input
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Ask Euclid about your estimate..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button onClick={handleSend} className="text-primary hover:text-primary/80 transition-colors">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Context Panel */}
        <div className="hidden lg:block w-64 border-l border-border bg-card p-4 space-y-4 overflow-y-auto">
          <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Context</h3>
          <div className="space-y-2">
            {contextItems.map((c) => (
              <div key={c.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <c.icon size={14} className="text-primary shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">{c.label}</p>
                  <p className="text-xs font-medium text-foreground">{c.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3">
            <h4 className="font-display text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Open Review Flags</h4>
            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded bg-warning/5 text-warning">HVAC — Low confidence</div>
              <div className="p-2 rounded bg-warning/5 text-warning">Paving — Derived from scale</div>
              <div className="p-2 rounded bg-warning/5 text-warning">Framing — Needs review</div>
              <div className="p-2 rounded bg-warning/5 text-warning">Drywall — Needs review</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
