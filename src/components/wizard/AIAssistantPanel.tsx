import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AIAssistantPanelProps {
  currentStep: string;
  epcBand?: string;
  currentFuel?: string;
  selectedTariff?: string;
  efficiency?: number;
  isVisible?: boolean;
}

const STEP_MESSAGES: Record<string, string> = {
  checking: "I'm putting your estimate together now.",
  primer: "I'll keep explanations simple — ask me anything at any time.",
  snapshot: "This is based on your EPC. Let me know if anything looks off.",
  estimate: "If anything looks confusing, tap me — I can explain each number in plain English.",
  personalise: "I can also help you prepare for the survey — just ask.",
  booking: "Almost there! Just a few details to book your survey.",
};

const SUGGESTION_CHIPS = [
  'What is EPC?',
  'Will it work in winter?',
  'Why does tariff matter?',
  'Do I need new radiators?',
  'Explain my savings number',
];

export function AIAssistantPanel({
  currentStep,
  epcBand,
  currentFuel,
  selectedTariff,
  efficiency,
  isVisible = true,
}: AIAssistantPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [hasShownTooltip, setHasShownTooltip] = useState(false);

  // Show tooltip on first appearance (once)
  useEffect(() => {
    if (isVisible && !hasShownTooltip && currentStep !== 'checking') {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        setHasShownTooltip(true);
        setTimeout(() => setShowTooltip(false), 4000);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, hasShownTooltip, currentStep]);

  // Show gentle pulse if inactive for 12 seconds (once per step)
  useEffect(() => {
    if (!isOpen && currentStep !== 'checking') {
      const timer = setTimeout(() => {
        setShowPulse(true);
        setTimeout(() => setShowPulse(false), 3000);
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isOpen]);

  if (!isVisible) return null;

  const currentMessage = STEP_MESSAGES[currentStep] || STEP_MESSAGES.primer;

  return (
    <>
      {/* Floating avatar button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Tooltip */}
        {showTooltip && !isOpen && (
          <div className="bg-card rounded-xl shadow-lg border border-border px-4 py-2 animate-fade-in max-w-[200px]">
            <p className="text-sm text-foreground">Ask me anything — I'll explain it simply.</p>
          </div>
        )}

        {/* Message bubble (collapsed) */}
        {!isOpen && currentMessage && (
          <div className="bg-card rounded-2xl rounded-br-lg shadow-soft border border-border px-4 py-3 max-w-[280px] animate-fade-in">
            <p className="text-sm text-foreground leading-relaxed">{currentMessage}</p>
          </div>
        )}

        {/* Avatar button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg transition-all hover:scale-105',
            showPulse && 'animate-pulse-slow'
          )}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-primary-foreground" />
          ) : (
            <MessageCircle className="w-6 h-6 text-primary-foreground" />
          )}
          {/* Halo effect */}
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping-slow pointer-events-none" />
        </button>
      </div>

      {/* Side sheet panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-elevated z-50 animate-slide-in-right flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Cosy Guide</h3>
                    <p className="text-xs text-muted-foreground">Ask about costs, savings, grants</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Context info */}
            {(epcBand || currentFuel || selectedTariff || efficiency) && (
              <div className="px-6 py-3 bg-muted/30 border-b border-border">
                <p className="text-xs text-muted-foreground mb-2">Your context:</p>
                <div className="flex flex-wrap gap-2">
                  {epcBand && (
                    <span className="px-2 py-1 text-xs bg-card rounded-full border border-border">
                      EPC {epcBand}
                    </span>
                  )}
                  {currentFuel && (
                    <span className="px-2 py-1 text-xs bg-card rounded-full border border-border">
                      {currentFuel}
                    </span>
                  )}
                  {selectedTariff && (
                    <span className="px-2 py-1 text-xs bg-card rounded-full border border-border">
                      {selectedTariff}
                    </span>
                  )}
                  {efficiency && (
                    <span className="px-2 py-1 text-xs bg-card rounded-full border border-border">
                      {Math.round(efficiency * 100)}% efficiency
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Suggestion chips */}
            <div className="p-6 flex-1 overflow-y-auto">
              <p className="text-sm text-muted-foreground mb-4">Common questions:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTION_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    className="px-3 py-2 text-sm bg-muted hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Placeholder for chat messages */}
              <div className="mt-8 text-center text-muted-foreground">
                <p className="text-sm">
                  I know about your EPC rating, heating type, selected tariff, and chosen efficiency.
                </p>
                <p className="text-sm mt-2">
                  Ask me anything about your estimate!
                </p>
              </div>
            </div>

            {/* Input (placeholder) */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a question..."
                  className="flex-1 h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Button size="icon" className="h-11 w-11 rounded-xl">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
