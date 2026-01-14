import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Bot, User, Sparkles, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import type { EPCData, EstimateResults } from '@/lib/calculations';
import type { Tariff } from '@/hooks/useTariffs';

type Message = { role: 'user' | 'assistant'; content: string };

interface EstimateChatProps {
  epcData: EPCData;
  results: EstimateResults;
  selectedTariff: Tariff | null;
  currentFuel: string;
  scop: number;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/estimate-chat`;

const SUGGESTED_QUESTIONS = [
  "How did you calculate my savings?",
  "What is SCOP?",
  "How does Cosy tariff work?",
  "Is a heat pump right for me?",
];

export function EstimateChat({ epcData, results, selectedTariff, currentFuel, scop }: EstimateChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Build context for the AI
  const buildEstimateContext = useCallback(() => {
    const transparency = results.transparency;
    return {
      property: {
        address: epcData.address,
        postcode: epcData.postcode,
        epcBand: epcData.epcBand || 'Unknown',
        floorArea: epcData.totalFloorArea,
        propertyType: epcData.propertyType,
      },
      currentHeating: {
        fuel: currentFuel,
        annualCost: Math.round(results.baselineCost),
        boilerEfficiency: results.boilerEfficiency,
      },
      heatPump: {
        selectedScop: scop,
        adjustedScopSpace: transparency?.scopSpace,
        adjustedScopDhw: transparency?.scopDhw,
        annualElectricityKwh: Math.round(results.hpElectricKwh),
        annualRunningCost: Math.round(results.hpCost),
      },
      savings: {
        annualSavings: Math.round(results.estimatedSavings),
        isNegative: results.estimatedSavings < 0,
      },
      tariff: {
        name: selectedTariff?.name || 'Unknown',
        isCosy: transparency?.isCosy,
        blendedRate: transparency?.blendedRate,
      },
      installCost: {
        baseInstall: results.installBase,
        adders: results.adders,
        totalBeforeGrant: results.grossInstallPrice,
        grantAmount: results.grantApplied,
        customerContribution: results.customerContribution,
      },
      heatDemand: {
        totalKwh: transparency?.totalHeatDemand,
        spaceKwh: transparency?.spaceHeatDemand,
        dhwKwh: transparency?.dhwDemand,
      },
    };
  }, [epcData, results, selectedTariff, currentFuel, scop]);

  const streamChat = async (userMessage: string) => {
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages,
          estimateContext: buildEstimateContext(),
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      // Add empty assistant message to start streaming into
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch {
            // Incomplete JSON, put back and wait
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        variant: 'destructive',
        title: 'Chat error',
        description: error instanceof Error ? error.message : 'Failed to get response',
      });
      // Remove the empty assistant message if error
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1 || prev[i].content !== ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    streamChat(input.trim());
  };

  const handleSuggestion = (question: string) => {
    if (isLoading) return;
    streamChat(question);
  };

  const hasMessages = messages.length > 0;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Questions about your estimate?
              <Sparkles className="w-4 h-4 text-primary" />
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Ask our AI assistant to explain any part of this quote
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Suggested questions - show when no messages */}
        {!hasMessages && (
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSuggestion(q)}
                disabled={isLoading}
                className="text-left text-sm p-3 rounded-lg bg-background border border-border hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Messages area */}
        {hasMessages && (
          <ScrollArea className="h-64 rounded-lg border bg-background p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.content ? (
                      msg.role === 'assistant' ? (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                            li: ({ children }) => <li>{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        msg.content
                      )
                    ) : (
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Thinking...
                      </span>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here..."
            disabled={isLoading}
            className="flex-1 bg-background"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Ask
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
