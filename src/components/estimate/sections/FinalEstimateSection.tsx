import { useState, useRef, useEffect } from 'react';
import { Gift, TrendingDown, Check, Calendar, Sparkles, Send, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { EstimateResults } from '@/lib/calculations';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import octopusPartnerLogo from '@/assets/octopus-partner.png';

interface FinalEstimateSectionProps {
  results: EstimateResults;
  currentFuel: string;
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
  gas: 'gas',
  oil: 'oil',
  lpg: 'LPG',
  electric: 'electric',
};

const WHATS_INCLUDED = [
  'Heat pump unit',
  'Hot water cylinder',
  'Full installation',
  'Controls & wiring',
  '£7,500 grant',
  '5-year warranty',
];

const STARTER_QUESTIONS = [
  "Will this work with my radiators?",
  "Will it be noisy?",
  "Is my home suitable?",
  "Can I change tariffs later?",
];

export function FinalEstimateSection({ 
  results, 
  currentFuel,
  context,
  onContinue,
  onBack,
}: FinalEstimateSectionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const savingsPositive = results.estimatedSavings > 0;
  const fuelLabel = FUEL_LABELS[currentFuel] || 'current';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (question: string) => {
    if (!question.trim() || isLoading) return;

    setShowChat(true);
    const userMessage: Message = { role: 'user', content: question.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('estimate-chat', {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            ...context,
            currentSection: 'final-estimate',
          },
        },
      });

      if (response.error) throw response.error;

      if (response.data?.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.message }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble answering right now. Feel free to book a call and we can discuss in person." 
      }]);
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          ✨ Your personalised estimate
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Here's your quote
        </h2>
      </div>

      {/* Main cost card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground mb-4 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-4 h-4" />
          <span className="text-sm opacity-90">£{results.grantApplied.toLocaleString()} grant applied</span>
        </div>
        <p className="text-xs opacity-75 mb-1">You pay</p>
        <p className="text-4xl sm:text-5xl font-bold mb-1">
          £{results.customerContribution.toLocaleString()}
        </p>
        <p className="text-xs opacity-75">
          Full install: £{results.grossInstallPrice.toLocaleString()}
        </p>
      </div>

      {/* Savings row */}
      <div className={cn(
        'p-4 rounded-xl border mb-4',
        savingsPositive ? 'bg-green-50 border-green-200' : 'bg-white border-border'
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            savingsPositive ? 'bg-green-100' : 'bg-muted'
          )}>
            <TrendingDown className={cn(
              'w-5 h-5',
              savingsPositive ? 'text-green-600' : 'text-muted-foreground'
            )} />
          </div>
          <div>
            <p className={cn(
              'text-xl font-bold',
              savingsPositive ? 'text-green-600' : 'text-foreground'
            )}>
              {savingsPositive ? '£' : '-£'}{Math.abs(results.estimatedSavings).toLocaleString()}/year
            </p>
            <p className="text-xs text-muted-foreground">
              {savingsPositive ? 'savings' : 'extra'} vs your {fuelLabel}
            </p>
          </div>
        </div>
      </div>

      {/* What's included */}
      <div className="p-4 rounded-xl bg-white border border-border mb-6">
        <h3 className="font-semibold text-foreground text-sm mb-3">What's included</h3>
        <div className="grid grid-cols-2 gap-2">
          {WHATS_INCLUDED.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Assistant section - neat and compact, not floating */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground text-sm">Questions? Ask our assistant</h3>
        </div>

        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {!showChat ? (
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-left px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted active:bg-muted text-sm text-foreground transition-colors"
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
                className="max-h-[200px] overflow-y-auto p-4"
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

              <div className="p-3 border-t border-border">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything about heat pumps or your quote…"
                    className="flex-1 bg-muted/30 border-0 focus-visible:ring-1"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    className="rounded-lg"
                    disabled={isLoading || !input.trim()}
                  >
                    <Send className="w-4 h-4" />
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
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl active:scale-[0.98] transition-transform"
      >
        <Calendar className="w-4 h-4 mr-2" />
        Book my design call
      </Button>

      {/* Reassurance */}
      <p className="text-center text-xs text-muted-foreground mt-4">
        No obligation • Takes 15 minutes • We'll confirm everything
      </p>
    </section>
  );
}
