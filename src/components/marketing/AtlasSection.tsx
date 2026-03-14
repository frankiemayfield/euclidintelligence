import { Bot, Send } from "lucide-react";
import { motion } from "framer-motion";

const prompts = [
"What scope items are missing here?",
"Where is this estimate most exposed?",
"Draft exclusions for this proposal",
"Compare this electrical package to historical patterns",
"Suggest contingency based on scope gaps"];


export function AtlasSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}>
            
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 text-xs font-semibold text-primary mb-5">
              <Bot size={14} /> Euclid AI
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Your always-available estimating expert

            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-md">
              Euclid answers practical estimating questions, surfaces risk factors, drafts clarifications, and recommends contingencies — all grounded in your actual project data.
            </p>
            <p className="text-sm text-muted-foreground">
              Not a generic chatbot. A specialized construction estimating assistant built on real project intelligence.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
            
            <div className="bg-muted/50 px-5 py-3 border-b border-border flex items-center gap-2">
              <Bot size={16} className="text-primary" />
              <span className="text-sm font-display font-semibold text-foreground">Euclid</span>
              <span className="text-xs text-muted-foreground ml-auto">Project-Aware</span>
            </div>
            <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-primary" />
                </div>
                <div className="bg-muted/50 rounded-lg rounded-tl-none p-3 text-sm text-foreground max-w-xs">
                  I've reviewed your uploaded scope document. I found 3 items that may need attention. Would you like me to walk through them?
                </div>
              </div>
              <div className="flex gap-3 items-start justify-end">
                <div className="bg-primary/10 rounded-lg rounded-tr-none p-3 text-sm text-foreground max-w-xs">
                  Yes, start with the biggest risk item.
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-primary" />
                </div>
                <div className="bg-muted/50 rounded-lg rounded-tl-none p-3 text-sm text-foreground max-w-xs">
                  Your HVAC package shows a $14,200 allowance but no ductwork line item. Based on similar 2,800 SF remodels in your region, I'd estimate $6,400–$8,100 for ductwork alone.
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {prompts.slice(0, 3).map((p) =>
                <span key={p} className="text-xs bg-accent rounded-full px-3 py-1 text-accent-foreground cursor-pointer hover:bg-primary/10 transition-colors">
                    {p}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                <input
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Ask Euclid about your estimate..."
                  readOnly />
                
                <Send size={16} className="text-primary" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

}
