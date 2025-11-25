
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToBot } from '../services/chatService';

const FormattedText = ({ text }: { text: string }) => {
  const lines = text.split('\n');

  return (
    <div className="space-y-1"> 
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        
        // Detect bullet points
        const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ') || line.trim().startsWith('• ');
        const content = isBullet ? line.trim().replace(/^[-*•]\s+/, '') : line;
        
        // Parse bold text: **text**
        const parts = content.split(/(\*\*.*?\*\*)/g);
        
        return (
          <div key={i} className={`${isBullet ? 'pl-2 flex gap-2' : ''}`}>
            {isBullet && <span className="opacity-70 mt-2 w-1 h-1 bg-current rounded-full flex-shrink-0" />}
            <span className="break-words">
              {parts.map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>;
                }
                return part;
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: 'Hello! I am your AI banking assistant. How can I help you with your finances today?',
      sender: 'bot',
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Generate a session ID once per mount
  const sessionIdRef = useRef(crypto.randomUUID());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      text: userText,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const botResponseText = await sendMessageToBot(userText, sessionIdRef.current);
      
      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        text: botResponseText,
        sender: 'bot',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        text: error instanceof Error ? error.message : "Sorry, I couldn't connect to the server.",
        sender: 'bot',
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-gray-950">
      <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/30">
                <Bot size={20} className="text-white" />
            </div>
            <div>
                <h2 className="font-semibold text-white">AI Assistant</h2>
                <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    Online
                </p>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.sender === 'user' ? 'bg-gray-700' : (msg.isError ? 'bg-red-900/30' : 'bg-blue-600/20')
            }`}>
                {msg.sender === 'user' ? <User size={14} /> : (msg.isError ? <AlertCircle size={14} className="text-red-400" /> : <Bot size={14} className="text-blue-400" />)}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : (msg.isError 
                    ? 'bg-red-900/10 border border-red-900/30 text-red-200 rounded-tl-sm' 
                    : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-sm')
            }`}>
                <FormattedText text={msg.text} />
                <div className={`text-[10px] mt-1 opacity-50 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                    <Bot size={14} className="text-blue-400" />
                </div>
                <div className="bg-gray-800 rounded-2xl p-3.5 rounded-tl-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-gray-900/50 border-t border-gray-800">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about your spending..."
            className="w-full bg-gray-950 border border-gray-800 rounded-full py-3.5 pl-5 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-1.5 top-1.5 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white disabled:opacity-50 disabled:bg-gray-700 transition-colors hover:bg-blue-500"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};
