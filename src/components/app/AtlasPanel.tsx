import { Bot, Send, X, Sparkles, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

type Message = { role: "atlas" | "user"; content: string; references?: { label: string; type: string }[] };

const contextSuggestions: Record<string, string[]> = {
  "/app/upload": [
    "What file types were uploaded?",
    "Classify my uploaded documents",
    "Which files look like estimates?",
    "Suggest next steps based on uploads",
  ],
  "/app/scope-analyzer": [
    "Which quantities are low confidence?",
    "Explain the concrete calculation",
    "What scope issues should I address first?",
    "Are there missing scope items?",
  ],
  "/app/bid-leveling": [
    "Compare electrical bids side by side",
    "Which bids have incomplete scope?",
    "What exclusions should I watch for?",
    "Which bid best matches the scope package?",
  ],
  "/app/estimate-builder": [
    "Explain the HVAC allowance assumption",
    "Which line items need review?",
    "Why is framing flagged medium confidence?",
    "Show pricing outliers",
  ],
  "/app/pricing": [
    "How does overhead affect my margin?",
    "Is my contingency adequate?",
    "Compare cost plus vs lump sum impact",
    "What markup do I need for 18% margin?",
  ],
  "/app/proposal-comparison": [
    "Why is my proposal above market?",
    "Which trades are driving the variance?",
    "How does my fee compare to peers?",
    "What changed after pricing was applied?",
  ],
  "/app/proposal": [
    "What sections should I include?",
    "Should I show contingency to the client?",
    "Draft exclusions for uncertain items",
    "Review the proposal for completeness",
  ],
  "/app/est-vs-actual": [
    "Which trades went over budget?",
    "What caused the HVAC variance?",
    "Show lessons learned for next project",
    "Are my estimates trending accurate?",
  ],
};

const contextLabels: Record<string, string> = {
  "/app/upload": "Document Upload",
  "/app/scope-analyzer": "Scope Analyzer",
  "/app/bid-leveling": "Bid Leveling",
  "/app/estimate-builder": "Estimate Builder",
  "/app/pricing": "Pricing & Margin",
  "/app/proposal-comparison": "Proposal Comparison",
  "/app/proposal": "Proposal Export",
  "/app/est-vs-actual": "Est. vs Actual",
};

const initialResponses: Record<string, string> = {
  "/app/upload": "I can see uploaded project files. I'll help classify documents and suggest the best workflow path based on what you've uploaded.",
  "/app/scope-analyzer": "I've loaded the scope data for Maple St. Kitchen Remodel. I can see 10 takeoff items — 4 need review and 2 have low confidence. How can I help?",
  "/app/bid-leveling": "I see subcontractor bids across 5 trade packages imported from Document Upload. I can help compare scope coverage and identify exclusions.",
  "/app/estimate-builder": "The estimate has 10 line items with a base cost of $168,700. 3 items need review and 1 has low confidence. What would you like to explore?",
  "/app/pricing": "Current pricing mode is Cost Plus with 18% combined markup. I can help analyze margin impact, compare strategies, or calculate target pricing.",
  "/app/proposal-comparison": "Your proposal is benchmarked against 20,000+ similar projects. Estimator Score is 78. I can explain variances and pricing position.",
  "/app/proposal": "The proposal has 11 sections — 9 are ready. I can help draft exclusions, review completeness, or suggest presentation improvements.",
  "/app/est-vs-actual": "I can see variance data across 10 trades. Overall the estimate was 2.1% under actual. I can help identify patterns and lessons learned.",
};

interface AtlasPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AtlasPanel({ isOpen, onClose }: AtlasPanelProps) {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [lastPath, setLastPath] = useState("");

  const currentPath = location.pathname;
  const suggestions = contextSuggestions[currentPath] || contextSuggestions["/app/scope-analyzer"]!;
  const contextLabel = contextLabels[currentPath] || "Estimator";

  // Reset messages when context changes
  if (currentPath !== lastPath) {
    setLastPath(currentPath);
    const initialMsg = initialResponses[currentPath];
    if (initialMsg && messages.length === 0) {
      setMessages([{ role: "atlas", content: initialMsg }]);
    } else if (initialMsg) {
      setMessages([{ role: "atlas", content: initialMsg }]);
    }
  }

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: "atlas",
          content: "Based on the current project data, I can see relevant patterns here. The key factors are the scope assumptions and how they flow through to pricing. I'd recommend reviewing the flagged items before finalizing — they could affect your proposal competitiveness by 3–5%.",
          references: [
            { label: "Maple St. Kitchen Remodel", type: "Project" },
            { label: contextLabel, type: "Context" },
          ],
        },
      ]);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col shrink-0 h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot size={14} className="text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground">Atlas - Estimator Assistant</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "atlas" && (
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={11} className="text-primary" />
              </div>
            )}
            <div className="max-w-[220px]">
              <div className={`rounded-lg p-2.5 text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-primary/10 text-foreground rounded-tr-sm"
                  : "bg-muted/50 text-foreground rounded-tl-sm"
              }`}>
                {m.content}
              </div>
              {m.references && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {m.references.map((ref, j) => (
                    <span key={j} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                      {ref.type}: {ref.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div className="px-3 py-2 border-t border-border">
        <div className="flex flex-wrap gap-1 mb-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => setInput(s)}
              className="text-[10px] bg-accent rounded-full px-2 py-1 text-accent-foreground hover:bg-primary/10 transition-colors">
              <Sparkles size={8} className="inline mr-0.5" />{s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-2.5 py-2">
          <input
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            placeholder="Ask Atlas..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend} className="text-primary hover:text-primary/80 transition-colors">
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AtlasToggleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed right-4 bottom-4 z-40 flex items-center gap-1.5 bg-primary text-primary-foreground rounded-full px-3 py-2 shadow-lg hover:bg-primary/90 transition-colors text-xs font-medium"
    >
      <Bot size={14} />
      <span>Atlas</span>
    </button>
  );
}
