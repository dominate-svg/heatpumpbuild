import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';

interface GuidePanelProps {
  currentStep: number;
  stepLabel: string;
  epcBand?: string;
  currentFuel?: string;
  selectedTariff?: string;
  efficiency?: number;
  estimateContext?: object;
}

const STEP_MESSAGES: Record<number, string> = {
  1: "I'll stay with you the whole way — if anything feels confusing, just ask me 😊",
  2: "This just helps us estimate how much heat your home needs — not a judgement 😊",
  3: "If you're not sure, that's okay — I'll still give you a reasonable estimate.",
  4: "Most people are surprised how simple heat pumps actually are 😊",
  5: "This affects the balance between upfront cost and running cost.",
  6: "The survey will confirm the best spot — this is just for the estimate.",
  7: "If you have a combi boiler now, you'll need a cylinder for hot water storage.",
  8: "This is a balanced estimate — your home survey fine-tunes this and often improves it 😊",
  9: "You're in good company — thousands have already made the switch.",
  10: "Almost there! Just a few details to book your free home visit.",
};

const STEP_SUGGESTIONS: Record<number, string[]> = {
  1: ["How long does this take?", "Is this really free?"],
  2: ["What does EPC mean?", "Why does insulation matter?"],
  3: ["Which fuel is cheapest?", "What if I'm not sure?"],
  4: ["Do they work in winter?", "How noisy are they?"],
  5: ["What's the difference?", "Which do you recommend?"],
  6: ["Does location matter much?", "What if space is tight?"],
  7: ["Do I need a new cylinder?", "What size do I need?"],
  8: ["How accurate is this?", "Why is the grant £7,500?"],
  9: ["How long is the install?", "What warranty do I get?"],
  10: ["What happens at the survey?", "Is there any obligation?"],
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function GuidePanel({ 
  currentStep, 
  stepLabel,
  epcBand, 
  currentFuel, 
  selectedTariff, 
  efficiency,
  estimateContext,
}: GuidePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentMessage = STEP_MESSAGES[currentStep] || STEP_MESSAGES[1];
  const currentSuggestions = STEP_SUGGESTIONS[currentStep] || STEP_SUGGESTIONS[1];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    try {
      const response = await supabase.functions.invoke('estimate-chat', {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          estimateContext: {
            ...estimateContext,
            currentStep: stepLabel,
            epcBand,
            currentFuel,
            selectedTariff,
            efficiency,
          },
        },
      });

      if (response.error) throw response.error;

      const reader = response.data.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              fullContent += content;
              setStreamingContent(fullContent);
            } catch {}
          }
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: fullContent }]);
      setStreamingContent('');
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I couldn't respond right now. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm">Your personal heat pump guide 🤝</h3>
            <p className="text-xs text-muted-foreground truncate">I'll explain everything — ask me anything</p>
          </div>
        </div>
      </div>

      {/* Context chips */}
      {(epcBand || currentFuel || selectedTariff) && (
        <div className="px-4 py-2 bg-muted/20 border-b border-border">
          <div className="flex flex-wrap gap-1.5">
            {epcBand && (
              <span className="px-2 py-0.5 text-xs bg-card rounded-full border border-border">
                EPC {epcBand}
              </span>
            )}
            {currentFuel && (
              <span className="px-2 py-0.5 text-xs bg-card rounded-full border border-border capitalize">
                {currentFuel}
              </span>
            )}
            {selectedTariff && (
              <span className="px-2 py-0.5 text-xs bg-card rounded-full border border-border">
                {selectedTariff}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Step-specific message */}
        <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
          <p className="text-sm text-foreground">{currentMessage}</p>
        </div>

        {/* Chat messages */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn(
              'rounded-xl p-3 text-sm',
              msg.role === 'user' 
                ? 'bg-muted ml-8' 
                : 'bg-card border border-border mr-4'
            )}
          >
          {msg.role === 'assistant' ? (
              <div className="prose prose-sm max-w-none text-foreground">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-foreground">{msg.content}</p>
            )}
          </div>
        ))}

        {/* Streaming content */}
        {streamingContent && (
          <div className="bg-card border border-border rounded-xl p-3 mr-4">
            <div className="prose prose-sm max-w-none text-foreground">
              <ReactMarkdown>{streamingContent}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !streamingContent && (
          <div className="bg-card border border-border rounded-xl p-3 mr-4">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 0 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-1.5">
            {currentSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSend(suggestion)}
                className="px-3 py-1.5 text-xs bg-muted hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Type a question..."
            className="flex-1 h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={isLoading}
          />
          <Button 
            size="icon" 
            className="h-10 w-10 rounded-xl"
            onClick={() => handleSend(input)}
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
