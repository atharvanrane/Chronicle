import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, RefreshCw, BookOpen, MessageSquare } from 'lucide-react';
import { Post } from '../types/blog';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePost?: Post | null;
  onClearContext?: () => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  activePost,
  onClearContext,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: activePost
        ? `Hello! I am Chronicle Copilot. I'm ready to answer any questions or discuss key insights from **"${activePost.title}"** by ${activePost.author.name}. What would you like to explore?`
        : `Greetings! I am Chronicle Copilot, your editorial advisor and literary assistant. I can help brainstorm essay ideas, refine headlines, structure arguments, or evaluate narrative tone. How can I assist you today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const promptText = textToSend || input;
    if (!promptText.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: promptText };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          articleContext: activePost
            ? {
                title: activePost.title,
                author: activePost.author.name,
                content: activePost.content,
              }
            : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Chat API returned an error');
      }

      const data = await res.json();
      setMessages([...nextMessages, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an issue connecting to the AI engine. Please verify the server configuration and try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = activePost
    ? [
        'Summarize the core thesis in 3 concise bullet points',
        'What are the strongest counterarguments to this piece?',
        'Explain the key takeaways for practitioners',
      ]
    : [
        'Suggest 5 compelling essay topics on modern design & craft',
        'How can I structure a 1,500-word philosophical essay?',
        'What makes an article headline irresistible without clickbait?',
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col h-[600px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-850/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>Chronicle Copilot</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-normal">
                  Gemini 3.8 Flash
                </span>
              </h3>
              <p className="text-[11px] text-neutral-500">
                {activePost ? `Analyzing: "${activePost.title}"` : 'Editorial & Writing Advisor'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activePost && onClearContext && (
              <button
                onClick={onClearContext}
                className="text-[11px] font-mono text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                title="Clear current article context"
              >
                Clear Context
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-1 border border-amber-300/40">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0 mt-1 text-xs font-mono">
                  U
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-neutral-400 font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
              <span>Thinking and drafting response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-6 py-2 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex flex-wrap gap-2">
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:border-amber-400 transition-colors truncate max-w-full"
            >
              ✦ {p}
            </button>
          ))}
        </div>

        {/* Text Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center gap-3"
        >
          <input
            type="text"
            placeholder={
              activePost
                ? `Ask anything about "${activePost.title}"...`
                : 'Ask a question or request editorial advice...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-opacity"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
