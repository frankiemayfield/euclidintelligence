import { Send, X, FileText, XCircle, Minus, Maximize2, Minimize2 } from "lucide-react";
import { EuclidCompass } from "./EuclidBrand";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

type Message = { role: "euclid" | "user"; content: string; references?: { label: string; type: string }[]; wide?: boolean };


const contextSuggestions: Record<string, string[]> = {
  "/app": [
    "Which projects need attention?",
    "Summarize active project health",
    "What proposals are ready to send?",
    "Show margin alerts across projects",
  ],
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
  "/app/estimate-comparison": [
    "Why is my estimate above market?",
    "Which trades are driving the variance?",
    "How does my Proposal Score compare?",
    "What changed after pricing was applied?",
  ],
  "/app/proposal-comparison": [
    "Why is my estimate above market?",
    "Which trades are driving the variance?",
    "How does my Proposal Score compare?",
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
  "/sub": [
    "Show what's due next",
    "Draft RFI for missing scope",
    "Generate exclusions list for Maple St.",
    "Find low-confidence takeoff items",
  ],
  "/sub/upload": [
    "What files are in this scope package?",
    "Classify uploaded documents by type",
    "Are any key drawings missing?",
    "Suggest next steps after upload",
  ],
  "/sub/scope-analyzer": [
    "Which scope items are unconfirmed?",
    "List low-confidence takeoff quantities",
    "Draft RFI for missing structural detail",
    "Summarize framing scope assumptions",
  ],
  "/sub/bid-leveling": [
    "Compare v1 vs v2 quote coverage",
    "What exclusions should I flag for GC?",
    "Which scope items are carried by other trades?",
    "Generate revised clarifications list",
  ],
  "/sub/estimate-builder": [
    "Which line items need review?",
    "Explain the lumber package pricing",
    "Are there missing framing scope items?",
    "Show pricing outliers in my quote",
  ],
  "/sub/pricing": [
    "How does my markup affect competitiveness?",
    "What margin do I need for 15% profit?",
    "Compare my pricing against market rates",
    "Is my contingency adequate for this scope?",
  ],
  "/sub/market-comparison": [
    "Why is my quote above market?",
    "Which cost categories are driving variance?",
    "How does my Proposal Score compare?",
    "What adjustments would improve my score?",
  ],
  "/sub/proposal": [
    "Draft exclusions for uncertain framing items",
    "Review the proposal for completeness",
    "Should I include alternates?",
    "Add clarification notes for the GC",
  ],
  "/sub/est-vs-actual": [
    "Which items went over budget?",
    "What caused the lumber variance?",
    "Show lessons learned for next bid",
    "Are my framing quotes trending accurate?",
  ],
  "/owner": [
    "Summarize project health",
    "What needs my attention?",
    "How does projected final compare to budget?",
    "Show open reviews and pending items",
  ],
  "/owner/upload": [
    "What files have been uploaded?",
    "Are all proposals extracted?",
    "Which documents need classification?",
    "Suggest next steps after upload",
  ],
  "/owner/proposals": [
    "Which proposal is most complete?",
    "Compare allowance amounts across proposals",
    "What is missing from Summit Oak's bid?",
    "Which exclusions should I be concerned about?",
  ],
  "/owner/leveling": [
    "Why is Summit Oak cheaper?",
    "What is the true comparable range?",
    "Which proposal has the lowest risk?",
    "Explain the leveling adjustments",
  ],
  "/owner/comparison": [
    "Show only flagged categories",
    "Which categories have the most variance?",
    "What is not mentioned in any proposal?",
    "Compare fixture allowances side by side",
  ],
  "/owner/market-comparison": [
    "How does this proposal compare to market?",
    "Which categories are below market?",
    "Is this pricing competitive for Cincinnati?",
    "Where is the biggest market deviation?",
  ],
  "/owner/documents": [
    "What documents are uploaded?",
    "Show contract-related documents",
    "Are there any missing document types?",
    "Summarize the signed contract",
  ],
  "/owner/budget": [
    "Which categories are over budget?",
    "What is driving the projected final increase?",
    "Show categories that need review",
    "How much has been paid vs invoiced?",
  ],
  "/owner/invoices": [
    "Which invoices need review?",
    "Does this invoice align with the contract?",
    "Are there any overlapping charges?",
    "Summarize invoice status across categories",
  ],
  "/owner/change-orders": [
    "Is this change order legitimate?",
    "What caused this change order?",
    "How much have change orders added to cost?",
    "Which change orders are owner-driven?",
  ],
};

const networkSuggestions = {
  "/network": [
    "Which subcontractors are out of compliance?",
    "Who have we worked with on the most projects?",
    "Which vendors have raised prices recently?",
    "Show subs qualified for framing work",
  ],
  "/compliance": [
    "What expires in the next 30 days?",
    "Which companies are missing a W-9?",
    "Summarize compliance risk across active projects",
    "What did the last document upload change?",
  ],
  "/activity": [
    "Summarize this week's activity",
    "What changed on Fregolle Residence?",
    "Which items still need my response?",
  ],
};
Object.assign(contextSuggestions, networkSuggestions);

const initialResponses: Record<string, string> = {
  "/network": "Your network has 16 companies — 7 subcontractors, 6 clients, and 3 vendors. 1 sub is out of compliance and 1 expires within 30 days. Who are you looking for?",
  "/compliance": "3 companies need attention: Spark Electric is out of compliance (workers comp expired), TrueFrame's auto policy expires 10/01, and Riverstone is missing a W-9. Upload documents and I'll extract and validate them.",
  "/activity": "Here's everything happening across your projects, bids, compliance, and cost activity. Ask me to summarize any stream.",
  "/app": "Welcome back. You have 6 active projects — 1 is below margin target and 1 proposal is ready to send. How can I help?",
  "/app/upload": "I can see uploaded project files. I'll help classify documents and suggest the best workflow path based on what you've uploaded.",
  "/app/scope-analyzer": "I've loaded the scope data for Fregolle Residence. I can see 10 takeoff items — 4 need review and 2 have low confidence. How can I help?",
  "/app/bid-leveling": "I see subcontractor bids across 5 trade packages imported from Document Upload. I can help compare scope coverage and identify exclusions.",
  "/app/estimate-builder": "The estimate has 10 line items with a current builder cost of $1,182,400. 3 items need review and 1 has low confidence. What would you like to explore?",
  "/app/pricing": "Current pricing mode is Cost Plus with 18% combined markup. I can help analyze margin impact, compare strategies, or calculate target pricing.",
  "/app/proposal-comparison": "Your estimate is benchmarked against 1,284 comparable projects. Proposal Score is 88. I can explain variances and pricing position.",
  "/app/estimate-comparison": "Your estimate is benchmarked against 1,284 comparable projects. Proposal Score is 88. I can explain variances and pricing position.",
  "/app/proposal": "The proposal has 8 sections — all are ready. I can help draft exclusions, review completeness, or suggest presentation improvements.",
  "/app/est-vs-actual": "I can see variance data across 10 trades. Overall the estimate was 2.1% under actual. I can help identify patterns and lessons learned.",
  "/sub": "Welcome back. You have 4 active quotes — 2 are due this week and 1 is ready to submit. I can see 6 open RFIs and 12 unconfirmed assumptions across your pipeline. What should we tackle first?",
  "/sub/upload": "I can see your uploaded scope package files. I'll help classify them and flag any missing documents before you proceed to scope analysis.",
  "/sub/scope-analyzer": "I've loaded the framing scope data for Fregolle Residence. I can see 9 takeoff items — 3 assumptions need confirmation and 1 RFI is open.",
  "/sub/bid-leveling": "I see your current quote version alongside the GC scope package. I can help compare coverage, identify gaps, and draft clarifications.",
  "/sub/estimate-builder": "Your framing quote has 9 line items with a base cost of $48,200. 2 items need review. Want me to check pricing or scope coverage?",
  "/sub/pricing": "Current markup is 22% combined. I can help analyze margin impact, compare strategies, or calculate target pricing for this bid.",
  "/sub/market-comparison": "Your quote is benchmarked against similar framing bids in the Cincinnati market. Proposal Score is 87. I can explain variances and positioning.",
  "/sub/proposal": "The proposal has 8 sections — all ready for export. I can help draft exclusions, review completeness, or add clarification notes.",
  "/sub/est-vs-actual": "I can see variance data for completed framing projects. Overall your estimates were 3.2% under actual. I can help identify patterns.",
  "/owner": "Welcome back, Andrew. Your project is in active construction with Alder Ridge Builders. Projected final is $331,750 — $19,350 above the original contract. 2 invoices and 1 change order need your review. How can I help?",
  "/owner/upload": "I can see 7 uploaded files — 3 contractor proposals have been extracted and classified. All documents are ready for analysis.",
  "/owner/proposals": "You have 3 contractor proposals uploaded. Alder Ridge is the most complete at 92%. Summit Oak has 6 scope flags. I can help compare them.",
  "/owner/leveling": "I've leveled all 3 proposals. Summit Oak's $278,900 headline becomes $318K–$345K once scope gaps are estimated. Alder Ridge remains the most complete.",
  "/owner/comparison": "Side-by-side comparison loaded. Summit Oak excludes painting, permits, and cleanup. I can filter to show only flagged or missing categories.",
  "/owner/market-comparison": "Market benchmarks loaded for Cincinnati-area residential renovations. Select a proposal to see category-level positioning against market data.",
  "/owner/documents": "8 project documents are on file — 3 proposals, 1 signed contract, plans, selections, and receipts. I can help find or summarize any document.",
  "/owner/budget": "Budget tracking is active. 2 categories are over budget (Structural, Fixtures) and 3 are on watch. Projected final is $331,750.",
  "/owner/invoices": "10 invoices submitted totaling $187,200. 3 need review — electrical rough-in appears higher than expected and plumbing fixture status needs confirmation.",
  "/owner/change-orders": "5 change orders totaling $14,850. 4 approved, 1 pending review (CO-005: fixture upgrade, $2,500). I can assess whether each is legitimate.",
};

interface UploadedFile {
  name: string;
  type: string;
}

interface AtlasPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AtlasPanel({ isOpen, onClose }: AtlasPanelProps) {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [lastPath, setLastPath] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [scopeContext, setScopeContext] = useState<{ summary: string; tab: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPath = location.pathname;
  const suggestions = contextSuggestions[currentPath] || contextSuggestions["/app/scope-analyzer"]!;

  useEffect(() => {
    const updateContext = (event: Event) => setScopeContext((event as CustomEvent<{ summary: string; tab: string }>).detail);
    window.addEventListener("euclid-scope-context", updateContext);
    return () => window.removeEventListener("euclid-scope-context", updateContext);
  }, []);

  useEffect(() => {
    if (!currentPath.endsWith("/scope-analyzer") || !scopeContext) return;
    setMessages(current => current.length === 1 && current[0]?.role === "euclid" ? [{ role: "euclid", content: scopeContext.summary }] : current);
  }, [currentPath, scopeContext]);

  // Reset messages when context changes
  if (currentPath !== lastPath) {
    setLastPath(currentPath);
    const initialMsg = currentPath.endsWith("/scope-analyzer") && scopeContext ? scopeContext.summary : initialResponses[currentPath];
    if (initialMsg) {
      setMessages([{ role: "euclid", content: initialMsg }]);
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
          role: "euclid",
          content: "Based on the current project data, I can see relevant patterns here. The key factors are the scope assumptions and how they flow through to pricing. I'd recommend reviewing the flagged items before finalizing — they could affect your proposal competitiveness by 3–5%.",
          references: [
            { label: "Fregolle Residence", type: "Project" },
          ],
        },
      ]);
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: UploadedFile[] = Array.from(files).map(f => ({
      name: f.name,
      type: f.name.endsWith(".pdf") ? "PDF" : f.name.endsWith(".xlsx") ? "Excel" : f.name.endsWith(".csv") ? "CSV" : "Document"
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setMessages(prev => [
      ...prev,
      { role: "euclid", content: `I've received ${newFiles.length} file${newFiles.length > 1 ? "s" : ""}: ${newFiles.map(f => f.name).join(", ")}. I can help analyze, classify, or answer questions about ${newFiles.length > 1 ? "these files" : "this file"}.` }
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (name: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== name));
  };

  if (!isOpen) return null;

  return (
    <div className="euclid-assistant fixed bottom-5 right-5 z-[90] flex h-[min(680px,calc(100vh-120px))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center">
              <EuclidCompass className="h-6 w-6" />
          </div>
          <div><p className="font-display text-sm font-bold text-foreground">Euclid AI</p><p className="text-[9px] text-muted-foreground">Construction assistant</p></div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50" aria-label="Minimize Euclid"><Minus size={16} /></button>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50" aria-label="Close Euclid"><X size={16} /></button>
        </div>
      </div>

      {/* Uploaded Files Bar */}
      {uploadedFiles.length > 0 && (
        <div className="px-4 py-2 border-b border-border bg-muted/30">
          <p className="text-[10px] text-muted-foreground font-medium mb-1.5">Uploaded Files</p>
          <div className="flex flex-wrap gap-1.5">
            {uploadedFiles.map(f => (
              <span key={f.name} className="inline-flex items-center gap-1 text-[10px] bg-card border border-border rounded-lg px-2 py-1 text-foreground">
                <FileText size={10} className="text-primary" />
                <span className="max-w-[120px] truncate">{f.name}</span>
                <button onClick={() => removeFile(f.name)} className="text-muted-foreground hover:text-foreground ml-0.5">
                  <XCircle size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "euclid" && (
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center">
                <EuclidCompass className="h-5 w-5" />
              </div>
            )}
            <div className={`max-w-[85%] ${m.role === "user" ? "" : ""}`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-primary/10 text-foreground rounded-tr-md"
                  : "bg-transparent text-foreground px-0 rounded-none"
              }`}>
                {m.content}
              </div>
              {m.references && (
                <div className="flex flex-wrap gap-1 mt-1.5">
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

      {/* Suggestions + Input */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {suggestions.map((s) => (
            <button key={s} onClick={() => setInput(s)}
              className="text-[10px] bg-card/55 border border-border/60 rounded-full px-2.5 py-1.5 text-accent-foreground hover:bg-card transition-colors">
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2.5">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple
            accept=".pdf,.xlsx,.csv,.xls,.docx,.doc,.png,.jpg,.jpeg" />
          <button onClick={() => fileInputRef.current?.click()} className="w-7 h-7 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0 flex items-center justify-center font-bold text-base" title="Upload to Euclid">
            +
          </button>
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Ask Euclid..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend} className="text-primary hover:text-primary/80 transition-colors shrink-0">
            <Send size={15} />
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
      className="euclid-assistant-launcher fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full"
      aria-label="Open Euclid"
    >
      <EuclidCompass className="h-8 w-8" />
    </button>
  );
}
