import { useState, useRef, useEffect } from 'react';
import { Gift, TrendingDown, TrendingUp, Check, Calendar, Sparkles, Send, Loader2, ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { EstimateResults } from '@/lib/calculations';
import { streamOpenAITextFromSSE, extractAssistantMessageFromNonStreamResponse } from '@/lib/sse';
import ReactMarkdown from 'react-markdown';
import octopusPartnerLogo from '@/assets/octopus-partner.png';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QuoteSectionProps {
  results: EstimateResults;
  currentFuel: string;
  epcContribution?: number | null;
  context: {
    epcBand?: string;
    floorArea?: number;
    currentFuel?: string;
    installCost?: number;
    savings?: number;
  };
  onContinue: () => void;
  onBack: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const FUEL_LABELS: Record<string, string> = {
  gas: 'gas boiler',
  oil: 'oil boiler',
  lpg: 'LPG boiler',
  electric: 'electric heating',
};

const WHATS_INCLUDED = [
  'Heat pump unit',
  'Hot water cylinder',
  'Full installation',
  'Controls & wiring',
  '£7,500 grant applied',
  '5-year warranty',
];

const STARTER_QUESTIONS = [
  "Will this work with my radiators?",
  "Will it be noisy?",
  "Is my home suitable?",
  "Can I change tariffs later?",
];

export function QuoteSection({ 
  results, 
  currentFuel,
  epcContribution,
  context,
  onContinue,
  onBack,
}: QuoteSectionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);

  // Use EPC-based contribution if provided, otherwise fall back to results
  const displayContribution = epcContribution ?? results.customerContribution;
  
  const savingsPositive = results.estimatedSavings > 0;
  const fuelLabel = FUEL_LABELS[currentFuel] || 'current heating';

  useEffect(() => {
    messagesRef.current = messages;
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const updateLastAssistantMessage = (content: string) => {
    setMessages(prev => {
      const updated = [...prev];
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i].role === 'assistant') {
          updated[i] = { role: 'assistant', content };
          return updated;
        }
      }
      return [...updated, { role: 'assistant', content }];
    });
  };

  const handleSend = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    setShowChat(true);

    const userMessage: Message = { role: 'user', content: trimmed };
    const conversation = [...messagesRef.current, userMessage];
    messagesRef.current = conversation;
    setMessages(conversation);
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/estimate-chat`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    };

    const buildBody = (stream: boolean) =>
      JSON.stringify({
        stream,
        messages: conversation.map(m => ({ role: m.role, content: m.content })),
        estimateContext: {
          ...context,
          installCostAfterGrant: results.customerContribution,
          fullPrice: results.grossInstallPrice,
          annualSavings: results.estimatedSavings,
          annualHeatingCost: results.hpCost,
          currentHeatingCost: results.baselineCost,
          scop: results.scopUsed,
          currentFuel,
        },
      });

    const request = async (stream: boolean) => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 30000);
      try {
        return await fetch(CHAT_URL, {
          method: 'POST',
          headers,
          body: buildBody(stream),
          signal: controller.signal,
          cache: 'no-store',
        });
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    let assistantContent = '';
    const pushDelta = (delta: string) => {
      assistantContent += delta;
      updateLastAssistantMessage(assistantContent);
    };

    try {
      let resp = await request(true);

      if (resp.ok && (!resp.body || typeof resp.body.getReader !== 'function')) {
        resp = await request(false);
      }

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to get response (${resp.status})`);
      }

      const contentType = resp.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream') && resp.body) {
        await streamOpenAITextFromSSE(resp, pushDelta);
        if (!assistantContent.trim()) {
          updateLastAssistantMessage("I didn't receive any text back — please try again.");
        }
      } else {
        const data = await resp.json().catch(() => null);
        const text = extractAssistantMessageFromNonStreamResponse(data) ?? '';
        updateLastAssistantMessage(text || "I didn't receive any text back — please try again.");
      }
    } catch (error) {
      console.error('Chat error:', error);
      updateLastAssistantMessage(
        "I'm having trouble answering right now. Feel free to book a call and we can discuss in person.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <section className="py-6 sm:py-10 animate-fade-in">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Badge */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
          ✨ Your personalised quote
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Here's your estimate
        </h2>
      </div>

      {/* Main cost card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground mb-4 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-4 h-4" />
          <span className="text-sm font-medium opacity-90">£{results.grantApplied.toLocaleString()} government grant applied</span>
        </div>
        <p className="text-xs opacity-75 mb-1 uppercase tracking-wide">You pay</p>
        <p className="text-4xl sm:text-5xl font-bold mb-2 tabular-nums">
          £{displayContribution.toLocaleString()}
        </p>
        <p className="text-xs opacity-75">
          Full installation price: £{(displayContribution + results.grantApplied).toLocaleString()}
        </p>
      </div>

      {/* Savings row */}
      <div className={cn(
        'p-4 rounded-xl border-2 mb-4 transition-all',
        savingsPositive 
          ? 'bg-green-50 border-green-200' 
          : 'bg-amber-50 border-amber-200'
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center',
            savingsPositive ? 'bg-green-100' : 'bg-amber-100'
          )}>
            {savingsPositive ? (
              <TrendingDown className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingUp className="w-5 h-5 text-amber-600" />
            )}
          </div>
          <div className="flex-1">
            <p className={cn(
              'text-xl font-bold tabular-nums',
              savingsPositive ? 'text-green-700' : 'text-amber-700'
            )}>
              {savingsPositive ? '−' : '+'}£{Math.abs(results.estimatedSavings).toLocaleString()}/year
            </p>
            <p className="text-xs text-muted-foreground">
              {savingsPositive ? 'savings' : 'extra'} compared to your {fuelLabel}
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground/50 hover:text-muted-foreground">
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  Based on your EPC data, home size, and the Octopus Cosy tariff. 
                  Actual savings depend on your usage and tariff.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* What's included */}
      <div className="p-4 rounded-xl bg-card border border-border mb-6">
        <h3 className="font-bold text-foreground text-sm mb-3">What's included</h3>
        <div className="grid grid-cols-2 gap-2">
          {WHATS_INCLUDED.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Assistant - inline before booking */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-foreground text-sm">Have questions before you book?</h3>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {!showChat ? (
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-3">
                Ask anything about your home, your quote, or heat pumps.
              </p>
              {/* Mobile-optimized touch targets */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="touch-manipulation text-left px-4 py-3 sm:px-3 sm:py-2.5 rounded-xl sm:rounded-lg bg-muted/50 hover:bg-muted active:bg-muted/80 active:scale-[0.98] text-sm text-foreground transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div 
                ref={scrollRef}
                className="max-h-[280px] sm:max-h-[300px] overflow-y-auto p-4"
              >
                <div className="space-y-3">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex',
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[85%] rounded-xl px-3 py-2',
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50'
                        )}
                      >
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-sm max-w-none text-foreground">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-xl px-3 py-2 bg-muted/50">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile-optimized input with larger touch targets */}
              <div className="p-3 border-t border-border">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    className="flex-1 bg-muted/30 border-0 focus-visible:ring-1 h-12 sm:h-11 text-base sm:text-sm"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    className="rounded-xl w-12 h-12 sm:w-11 sm:h-11"
                    disabled={isLoading || !input.trim()}
                  >
                    <Send className="w-5 h-5 sm:w-4 sm:h-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Trust badge */}
      <div className="flex justify-center mb-6">
        <img 
          src={octopusPartnerLogo} 
          alt="Octopus Trusted Partner" 
          className="h-8 opacity-70"
        />
      </div>

      {/* CTA */}
      <Button 
        onClick={onContinue}
        size="lg"
        className="w-full h-14 text-base sm:text-lg font-bold rounded-xl active:scale-[0.98] transition-all cta-hover-lift"
      >
        <Calendar className="w-5 h-5 mr-2" />
        Book my design call
      </Button>

      {/* Reassurance */}
      <p className="text-center text-xs text-muted-foreground mt-4">
        No obligation • Takes 15 minutes • We'll confirm everything
      </p>
    </section>
  );
}
