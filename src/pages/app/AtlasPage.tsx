import { AppLayout } from "@/components/app/AppLayout";
import { Bot, Send, FileText, Sparkles } from "lucide-react";
import { useState } from "react";

type Message = { role: "atlas" | "user"; content: string };

const initialMessages: Message[] = [
  {
    role: "atlas",
    content: "I've loaded the Maple St. Kitchen Remodel project. I can see the uploaded scope document and the current estimate with 10 line items. How can I help?",
  },
];

const suggestions = [
  "What scope items are missing?",
  "Where is this estimate most exposed?",
  "Draft exclusions for this proposal",
  "Suggest contingency based on scope gaps",
];

export default function AtlasPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, content: input };
    setMessages([...messages, userMsg]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "atlas" as const,
          content:
            "Based on your current estimate, the highest exposure area is the HVAC package. The $14,200 allowance doesn't break out ductwork separately, and for a 2,800 SF addition in the Midwest region, I'd expect ductwork to run $6,400–$8,100 on its own. I'd recommend splitting that line item and getting a dedicated ductwork sub quote. Would you like me to draft that as a separate line item?",
        },
      ]);
    }, 1200);
  };

  const handleSuggestion = (s: string) => {
    setInput(s);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-foreground">Estimator Atlas</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText size={10} /> Maple St. Kitchen Remodel — Project-aware
            </p>
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
              <div
                className={`max-w-lg rounded-xl p-4 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary/10 text-foreground rounded-tr-sm"
                    : "bg-muted/50 text-foreground rounded-tl-sm"
                }`}
              >
                {m.content}
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
              placeholder="Ask Atlas about your estimate..."
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
    </AppLayout>
  );
}
