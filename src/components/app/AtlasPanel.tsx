import { Bot, Send, X, Sparkles, Upload, FileText, XCircle } from "lucide-react";
import { useState, useRef } from "react";
import { useLocation } from "react-router-dom";

type Message = { role: "atlas" | "user"; content: string; references?: { label: string; type: string }[] };

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
};

const initialResponses: Record<string, string> = {
  "/app": "Welcome back. You have 6 active projects — 1 is below margin target and 1 proposal is ready to send. How can I help?",
  "/app/upload": "I can see uploaded project files. I'll help classify documents and suggest the best workflow path based on what you've uploaded.",
  "/app/scope-analyzer": "I've loaded the scope data for Maple St. Kitchen Remodel. I can see 10 takeoff items — 4 need review and 2 have low confidence. How can I help?",
  "/app/bid-leveling": "I see subcontractor bids across 5 trade packages imported from Document Upload. I can help compare scope coverage and identify exclusions.",
  "/app/estimate-builder": "The estimate has 10 line items with a base cost of $168,700. 3 items need review and 1 has low confidence. What would you like to explore?",
  "/app/pricing": "Current pricing mode is Cost Plus with 18% combined markup. I can help analyze margin impact, compare strategies, or calculate target pricing.",
  "/app/proposal-comparison": "Your estimate is benchmarked against 20,000+ similar projects. Proposal Score is 78. I can explain variances and pricing position.",
  "/app/estimate-comparison": "Your estimate is benchmarked against 20,000+ similar projects. Proposal Score is 78. I can explain variances and pricing position.",
  "/app/proposal": "The proposal has 8 sections — all are ready. I can help draft exclusions, review completeness, or suggest presentation improvements.",
  "/app/est-vs-actual": "I can see variance data across 10 trades. Overall the estimate was 2.1% under actual. I can help identify patterns and lessons learned.",
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPath = location.pathname;
  const suggestions = contextSuggestions[currentPath] || contextSuggestions["/app/scope-analyzer"]!;

  // Reset messages when context changes
  if (currentPath !== lastPath) {
    setLastPath(currentPath);
    const initialMsg = initialResponses[currentPath];
    if (initialMsg) {
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
      { role: "atlas", content: `I've received ${newFiles.length} file${newFiles.length > 1 ? "s" : ""}: ${newFiles.map(f => f.name).join(", ")}. I can help analyze, classify, or answer questions about ${newFiles.length > 1 ? "these files" : "this file"}.` }
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (name: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== name));
  };

  if (!isOpen) return null;

  return (
    <div className="w-[340px] xl:w-[380px] border-l border-border bg-card flex flex-col shrink-0 h-full rounded-tl-2xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot size={16} className="text-primary" />
          </div>
          <p className="text-sm font-bold text-foreground font-display">Atlas - Estimator Assistant</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50">
          <X size={16} />
        </button>
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
            {m.role === "atlas" && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Bot size={13} className="text-primary" />
              </div>
            )}
            <div className={`max-w-[85%] ${m.role === "user" ? "" : ""}`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-primary/10 text-foreground rounded-tr-md"
                  : "bg-muted/50 text-foreground rounded-tl-md"
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
              className="text-[10px] bg-accent rounded-full px-2.5 py-1.5 text-accent-foreground hover:bg-primary/10 transition-colors">
              <Sparkles size={8} className="inline mr-1" />{s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2.5">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple
            accept=".pdf,.xlsx,.csv,.xls,.docx,.doc,.png,.jpg,.jpeg" />
          <button onClick={() => fileInputRef.current?.click()} className="w-7 h-7 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0 flex items-center justify-center font-bold text-base" title="Upload to Atlas">
            +
          </button>
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Ask Atlas..."
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
      className="fixed right-4 bottom-4 z-40 flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2.5 shadow-lg hover:bg-primary/90 transition-colors text-sm font-medium"
    >
      <Bot size={16} />
      <span>Open Atlas</span>
    </button>
  );
}