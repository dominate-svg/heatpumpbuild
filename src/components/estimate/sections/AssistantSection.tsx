import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface AssistantSectionProps {
  context: {
    epcBand?: string;
    floorArea?: number;
    currentFuel?: string;
    installCost?: number;
    savings?: number;
  };
  onBack: () => void;
  onContinue: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_QUESTIONS = [
  "Will this work with my radiators?",
  "Will my home feel warmer?",
  "What happens on install day?",
  "Can I change anything later?",
  "Is this cheaper than my boiler?",
];

export function AssistantSection({ context, onBack, onContinue }: AssistantSectionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (question: string) => {
    if (!question.trim() || isLoading) return;

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
            currentSection: 'assistant',
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
        content: "I'm having trouble answering right now. Feel free to book a call and we can discuss your questions in person." 
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
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
          Got questions?
        </h2>
        <p className="text-sm text-muted-foreground">
          Ask our Heat Pump Assistant anything
        </p>
      </div>

      {/* Chat area */}
      <div className="bg-white rounded-xl border border-border shadow-sm mb-6 overflow-hidden">
        {/* Messages or starter prompts */}
        <div 
          ref={scrollRef}
          className="max-h-[300px] overflow-y-auto p-4"
        >
          {messages.length === 0 ? (
            <div>
              <p className="text-xs text-muted-foreground mb-3">
                Tap a question or type your own:
              </p>
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
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a question..."
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
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        <Button 
          onClick={onContinue}
          size="lg"
          className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl active:scale-[0.98] transition-transform"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Book a design call
        </Button>
        
        <Button 
          onClick={onBack}
          variant="ghost"
          className="w-full text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to estimate
        </Button>
      </div>
    </section>
  );
}
