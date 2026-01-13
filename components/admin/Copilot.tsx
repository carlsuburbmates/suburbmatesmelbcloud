'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming shadcn utils or generic class joiner

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function Copilot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello Operator. I am your Chief of Staff. How can I help you prioritize today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const updatedMessages = [...messages, { role: 'user' as const, content: input }];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/ai/copilot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: updatedMessages.map(m => ({ role: m.role, content: m.content })) })
            });
            const data = await res.json();
            
            if (data.reply) {
                 setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                 setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
            }

        } catch (err) {
            console.error(err);
             setMessages(prev => [...prev, { role: 'assistant', content: 'Connection failed.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] h-[500px] bg-white border border-slate-200 shadow-2xl rounded-xl flex flex-col overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-slate-900 text-white p-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span className="font-semibold text-sm">Operator Copilot</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-slate-700 p-1 rounded">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 bg-slate-50 p-4 overflow-y-auto" ref={scrollRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={cn(
                                "mb-3 max-w-[85%] text-sm rounded-lg p-3",
                                m.role === 'user' 
                                    ? "ml-auto bg-blue-600 text-white" 
                                    : "mr-auto bg-white border border-slate-200 text-slate-800"
                            )}>
                                {m.content}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="mr-auto bg-white border border-slate-200 text-slate-500 text-xs rounded-lg p-3 animate-pulse">
                                Thinking...
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask copilot..."
                            className="flex-1 text-sm bg-slate-50 border-transparent focus:border-blue-500 focus:bg-white rounded-md px-3 py-2 outline-none transition-all"
                            disabled={isLoading}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isLoading}
                            className="bg-slate-900 text-white p-2 rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Float Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 pointer-events-auto hover:scale-105 active:scale-95",
                    isOpen ? "bg-slate-200 text-slate-600 rotate-90" : "bg-slate-900 text-white"
                )}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6 text-amber-400" />}
            </button>
        </div>
    );
}
