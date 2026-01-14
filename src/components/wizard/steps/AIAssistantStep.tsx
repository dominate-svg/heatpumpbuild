import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import type { EstimateResults } from '@/lib/calculations';
import { cn } from '@/lib/utils';

interface AIAssistantStepProps {
  results: EstimateResults;
  currentFuel: string;
  epcBand?: string;
  onContinue: () => void;
  onBack: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const EXAMPLE_QUESTIONS = [
  "Will this actually work in a poorly insulated home?",
  "What happens if electricity prices go up?",
  "Is a heat pump noisy?",
  "What maintenance does it need?",
  "Is this worth it for oil homes?",
  "How long does installation take?",
];

export function AIAssistantStep({ 
  results, 
  currentFuel,
  epcBand,
  onContinue, 
  onBack 
}: AIAssistantStepProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const handleSend = async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: question.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    try {
      const context = {
        epcBand: epcBand || results.epcBand,
        currentFuel,
        floorArea: results.floorArea,
        heatLossKw: results.heatLossKw,
        annualSavings: results.estimatedSavings,
        installCost: results.grossInstallPrice,
        grantAmount: results.grantApplied,
        customerContribution: results.customerContribution,
        runningCost: results.hpCost,
        confidenceLabel: results.confidenceLabel,
      };

      const response = await supabase.functions.invoke('estimate-chat', {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          context,
        },
      });

      if (response.error) throw response.error;

      // Handle streaming response
      const reader = response.data?.getReader?.();
      if (reader) {
        let accumulated = '';
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          accumulated += chunk;
          setStreamingContent(accumulated);
        }
        
        setMessages(prev => [...prev, { role: 'assistant', content: accumulated }]);
        setStreamingContent('');
      } else if (response.data?.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.message }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I couldn't process that question. Please try again or book a survey to speak with a human expert." 
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
    <div className="animate-fade-in h-full flex flex-col">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-3">
          <MessageCircle className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-1">
          Got questions? Ask our heat pump assistant
        </h1>
        <p className="text-muted-foreground text-sm">
          Get clear answers before you decide.
        </p>
      </div>

      {/* Chat area */}
      <div className="flex-1 min-h-0 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 && !isLoading ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Click a question or type your own:
              </p>
              <div className="grid gap-2">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-left p-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-sm text-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
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
                      'max-w-[85%] rounded-2xl px-4 py-3',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Streaming content */}
              {streamingContent && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-muted">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{streamingContent}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Loading indicator */}
              {isLoading && !streamingContent && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-3 bg-muted">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input area */}
        <div className="p-3 border-t border-border">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={isLoading || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-4 space-y-3">
        <Button 
          onClick={onContinue} 
          className="w-full h-12 text-base"
          size="lg"
        >
          I'm ready to speak to a human →
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Book a free home survey — no obligation, no pressure.
        </p>
      </div>
    </div>
  );
}
