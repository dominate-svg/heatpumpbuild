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
  primer: "I'll keep explanations simple — ask me anything.",
  snapshot: "This is based on your EPC. Let me know if anything looks off.",
  estimate: "Tap me if anything looks confusing — I can explain.",
  personalise: "I can help you prepare for the survey — just ask.",
  booking: "Almost there! Just a few details to book.",
};

const SUGGESTION_CHIPS = [
  'What is EPC?',
  'Will it work in winter?',
  'Why does tariff matter?',
  'Do I need new radiators?',
  'Explain my savings',
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
  const [hasShownTooltip, setHasShownTooltip] = useState(false);

  // Show tooltip on first appearance (once)
  useEffect(() => {
    if (isVisible && !hasShownTooltip && currentStep !== 'checking') {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        setHasShownTooltip(true);
        setTimeout(() => setShowTooltip(false), 3000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, hasShownTooltip, currentStep]);

  if (!isVisible) return null;

  const currentMessage = STEP_MESSAGES[currentStep] || STEP_MESSAGES.primer;

  return (
    <>
      {/* Floating avatar button - mobile: bottom-right with smaller bubble */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2 sm:gap-3">
        {/* Tooltip */}
        {showTooltip && !isOpen && (
          <div className="bg-card rounded-xl shadow-lg border border-border px-3 py-2 animate-fade-in max-w-[180px] sm:max-w-[200px]">
            <p className="text-xs sm:text-sm text-foreground">Ask me anything!</p>
          </div>
        )}

        {/* Message bubble (collapsed) - smaller on mobile */}
        {!isOpen && currentMessage && (
          <div className="bg-card rounded-2xl rounded-br-lg shadow-soft border border-border px-3 py-2 sm:px-4 sm:py-3 max-w-[220px] sm:max-w-[280px] animate-fade-in">
            <p className="text-xs sm:text-sm text-foreground leading-relaxed">{currentMessage}</p>
          </div>
        )}

        {/* Avatar button - touch-friendly size */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary flex items-center justify-center shadow-lg transition-all active:scale-95 hover:scale-105"
        >
          {isOpen ? (
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          ) : (
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          )}
          {/* Halo effect */}
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping-slow pointer-events-none" />
        </button>
      </div>

      {/* Full-screen panel on mobile, side sheet on desktop */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel - full height on mobile, side sheet on desktop */}
          <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:left-auto sm:right-0 h-[85vh] sm:h-full w-full sm:max-w-md bg-card border-t sm:border-t-0 sm:border-l border-border shadow-elevated z-50 animate-slide-in-right flex flex-col rounded-t-3xl sm:rounded-none">
            {/* Drag handle - mobile only */}
            <div className="sm:hidden flex justify-center py-2">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 sm:px-6 pb-4 pt-2 sm:pt-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">Cosy Guide</h3>
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
              <div className="px-4 sm:px-6 py-3 bg-muted/30 border-b border-border">
                <p className="text-xs text-muted-foreground mb-2">Your context:</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {epcBand && (
                    <span className="px-2 py-0.5 text-xs bg-card rounded-full border border-border">
                      EPC {epcBand}
                    </span>
                  )}
                  {currentFuel && (
                    <span className="px-2 py-0.5 text-xs bg-card rounded-full border border-border">
                      {currentFuel}
                    </span>
                  )}
                  {selectedTariff && (
                    <span className="px-2 py-0.5 text-xs bg-card rounded-full border border-border">
                      {selectedTariff}
                    </span>
                  )}
                  {efficiency && (
                    <span className="px-2 py-0.5 text-xs bg-card rounded-full border border-border">
                      {Math.round(efficiency * 100)}%
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Suggestion chips */}
            <div className="px-4 sm:px-6 py-4 sm:py-6 flex-1 overflow-y-auto">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Common questions:</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {SUGGESTION_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    className="px-3 py-2 text-xs sm:text-sm bg-muted hover:bg-primary/10 hover:text-primary rounded-full transition-colors active:scale-95"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Placeholder */}
              <div className="mt-6 sm:mt-8 text-center text-muted-foreground">
                <p className="text-xs sm:text-sm">
                  I know about your EPC rating, heating type, tariff, and efficiency.
                </p>
                <p className="text-xs sm:text-sm mt-2">
                  Ask me anything about your estimate!
                </p>
              </div>
            </div>

            {/* Input - larger touch target on mobile */}
            <div className="p-3 sm:p-4 border-t border-border pb-safe">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a question..."
                  className="flex-1 h-11 sm:h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
