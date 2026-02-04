"use client";

import React, { useEffect, useRef } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
  logs: string[];
}

// Log sanitization function
const sanitizeLog = (log: string): string => {
  // Remove or mask sensitive information
  return log
    // Mask API keys (common patterns)
    .replace(/(sk-(?:[a-zA-Z0-9]{20,}))/g, 'sk-***')
    // Mask file paths that might reveal system structure
    .replace(/(\/[^\s]*\/(?:home|users|root)\/[^\s]*)/gi, '/***')
    // Mask email addresses
    .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '***@***.***')
    // Mask IP addresses
    .replace(/(\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b)/g, '***.***.***.***')
    // Mask common credential patterns
    .replace(/(password\s*[=:]\s*['"]?[^'"\s]+['"]?)/gi, 'password=***')
    .replace(/(token\s*[=:]\s*['"]?[^'"\s]+['"]?)/gi, 'token=***')
    .replace(/(key\s*[=:]\s*['"]?[^'"\s]+['"]?)/gi, 'key=***');
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
            <span dangerouslySetInnerHTML={{ 
              __html: sanitizeLog(log) 
            }} />
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