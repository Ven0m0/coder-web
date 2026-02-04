"use client";

import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, Command, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { tokenOptimizer } from '@/utils/tokenOptimizer';

interface Message {
  role: 'user' | 'agent';
  content: string;
  status?: 'thinking' | 'executing' | 'done';
  optimized?: boolean;
}

interface ChatInterfaceProps {
  onSendMessage: (msg: string) => void;
  messages: Message[];
}

// Simple input sanitization function
const sanitizeInput = (input: string): string => {
  // Remove potentially dangerous characters/sequences
  return input
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

// Validate input length
const validateInput = (input: string): { isValid: boolean; error?: string } => {
  if (input.length === 0) {
    return { isValid: false, error: "Message cannot be empty" };
  }
  
  if (input.length > 2000) {
    return { isValid: false, error: "Message is too long (max 2000 characters)" };
  }
  
  return { isValid: true };
};

const ChatInterface = ({ onSendMessage, messages }: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const [useOptimization, setUseOptimization] = useState(true);
  const [filterOutput, setFilterOutput] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const validation = validateInput(input);
    if (!validation.isValid) {
      setError(validation.error || "Invalid input");
      return;
    }
    
    // Sanitize input
    const sanitizedInput = sanitizeInput(input);
    
    // Optimize input if enabled
    const optimizedInput = useOptimization 
      ? tokenOptimizer.optimizeContent(sanitizedInput) 
      : sanitizedInput;
    
    onSendMessage(optimizedInput);
    setInput('');
    setError('');
  };

  // Process message content for display
  const processMessageContent = (msg: Message) => {
    if (msg.role === 'user') return msg.content;
    
    // For agent messages, apply filtering if enabled
    if (filterOutput && !msg.optimized) {
      const filters = ['extra-whitespace', 'repeated-lines'];
      return tokenOptimizer.filterOutput(msg.content, filters);
    }
    
    return msg.content;
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] text-zinc-200">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#1a1a1a]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">OpenCode Agent</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Ready to code</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className="bg-zinc-900 border-zinc-700 text-zinc-400 gap-1 cursor-pointer"
            onClick={() => setFilterOutput(!filterOutput)}
          >
            <span className={filterOutput ? "text-emerald-400" : "text-zinc-500"}>●</span>
            <span>Filter Output</span>
          </Badge>
          <Badge 
            variant="outline" 
            className="bg-zinc-900 border-zinc-700 text-zinc-400 gap-1 cursor-pointer"
            onClick={() => setUseOptimization(!useOptimization)}
          >
            <Zap size={12} className={useOptimization ? "text-amber-400" : "text-zinc-500"} />
            <span>Optimize Input</span>
          </Badge>
          <Badge variant="outline" className="bg-zinc-900 border-zinc-700 text-zinc-400 gap-1">
            <Command size={12} />
            <span>Agent Mode</span>
          </Badge>
        </div>
      </div>
      <ScrollArea className="flex-1 px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'agent' && (
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 border border-zinc-700">
                  <Sparkles size={14} className="text-indigo-400" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-zinc-800/50 border border-zinc-800 text-zinc-300 rounded-tl-none'
              }`}>
                {processMessageContent(msg)}
                {msg.status === 'thinking' && (
                  <div className="mt-2 flex gap-1">
                    <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
                {msg.optimized && (
                  <Badge variant="secondary" className="mt-2 text-[9px] h-4 px-1.5 bg-zinc-700 text-zinc-300 border-none">
                    Token-optimized
                  </Badge>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-zinc-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-6 border-t border-zinc-800 bg-[#1a1a1a]">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
          <Input 
            value={input} 
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError('');
            }} 
            placeholder="Ask the agent to build something..." 
            className="w-full bg-zinc-900 border-zinc-800 text-zinc-200 h-14 pl-4 pr-14 rounded-xl focus-visible:ring-indigo-500 focus-visible:ring-offset-0" 
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-2 top-2 h-10 w-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
          >
            <Send size={18} />
          </Button>
        </form>
        {error && (
          <p className="text-[10px] text-center text-red-400 mt-2">{error}</p>
        )}
        <p className="text-[10px] text-center text-zinc-600 mt-4 uppercase tracking-widest font-medium">
          Powered by OpenCode CLI • Agent Mode Active
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;