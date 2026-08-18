import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { ChatMessage, Category, Subcategory } from '../types';
import { geminiService } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

interface ChatInterfaceProps {
  category: Category;
  subcategory: Subcategory;
  onFinishChat: (draft: string) => void;
}

export default function ChatInterface({ category, subcategory, onFinishChat }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const greeting = await geminiService.getInitialGreeting(category.name, subcategory.name);
      setMessages([{ role: 'assistant', content: greeting }]);
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    const response = await geminiService.respondToUser(nextMessages, category.name, subcategory.name);
    
    // Extract draft if present
    const draftMatch = response.match(/<draft>([\s\S]*?)<\/draft>/);
    let finalContent = response;
    
    if (draftMatch) {
      const extractedDraft = draftMatch[1].trim();
      setDraft(extractedDraft);
      finalContent = response.replace(/<draft>[\s\S]*?<\/draft>/, "").trim();
      if (!finalContent) finalContent = "Przygotowałem projekt Twojego zapytania. Sprawdź go poniżej.";
    }

    setMessages(prev => [...prev, { role: 'assistant', content: finalContent }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-2xl mx-auto bg-white/20 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/40">
      {/* Header */}
      <div className="p-8 bg-blue-600 text-white flex items-center justify-between shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="font-bold text-2xl tracking-tight">Asystent AI</h3>
          <p className="text-blue-100 text-xs font-medium uppercase tracking-widest mt-1">Przygotowywanie zapytania</p>
        </div>
        <Sparkles className="w-10 h-10 text-white/20 absolute right-6 top-1/2 -translate-y-1/2" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400 to-transparent opacity-30" />
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 bg-white/10"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] p-5 rounded-3xl shadow-sm backdrop-blur-md ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white/60 text-slate-800 border border-white/50 rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed font-sans">{m.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/40 backdrop-blur-md p-4 rounded-2xl rounded-tl-none border border-white/50 flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Draft Preview / Footer */}
      <div className="p-8 bg-white/30 backdrop-blur-xl border-t border-white/30">
        <AnimatePresence>
          {draft && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-6 bg-blue-50/50 backdrop-blur-md rounded-3xl border border-blue-200/50 shadow-inner"
            >
              <div className="flex items-center gap-2 text-blue-800 font-bold mb-3">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
                <span className="text-lg">Projekt gotowy!</span>
              </div>
              <button 
                onClick={() => onFinishChat(draft)}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                id="finish-chat-btn"
              >
                Sprawdź zapytanie
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Opisz swój problem..."
            className="flex-1 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl px-6 py-5 focus:bg-white/70 focus:ring-2 focus:ring-blue-400 outline-none text-slate-800 shadow-sm transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            id="chat-input"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            id="send-chat-msg"
          >
            <Send className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
}
