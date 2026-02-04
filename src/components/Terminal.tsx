"use client";

import React, { useEffect, useRef } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
  logs: string[];
}

// Function to filter sensitive information from logs
const filterLog = (log: string): string => {
  return log
    // Remove file paths that might expose system structure
    .replace(/\/[^\s]*\/[^\s]*/g, '[PATH_REDACTED]')
    // Remove potential API keys (patterns like sk-... or api_...)
    .replace(/(sk|api)_[a-zA-Z0-9]{10,}/g, '[API_KEY_REDACTED]')
    // Remove potential tokens
    .replace(/(token|key|secret)[\s]*[=:][\s]*["']?[a-zA-Z0-9\-_]{10,}["']?/gi, '[CREDENTIAL_REDACTED]')
    // Remove email addresses
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
    // Remove IP addresses
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_REDACTED]');
};

const Terminal = ({ logs }: TerminalProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-[#0c0c0c] border-t border-zinc-800 font-mono text-sm">
      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-zinc-400">
        <TerminalIcon size={14} />
        <span className="text-xs font-medium uppercase tracking-wider">Terminal - opencode-cli</span>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-1 text-zinc-300 selection:bg-zinc-700"
      >
        {logs.map((log, i) => (
          <div key={i} className="whitespace-pre-wrap break-all">
            <span className="text-emerald-500 mr-2">❯</span>
            {filterLog(log)}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-zinc-600 italic">Waiting for agent commands...</div>
        )}
      </div>
    </div>
  );
};

export default Terminal;