"use client";

import React, { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import Terminal from '@/components/Terminal';
import FileExplorer from '@/components/FileExplorer';
import SettingsPanel from '@/components/SettingsPanel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'user' | 'agent';
  content: string;
  status?: 'thinking' | 'executing' | 'done';
}

const Index = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'agent', content: "Hello! I'm your OpenCode agent. I'm currently configured with Anthropic Claude and have 2 MCP servers active. How can I help you today?" }
  ]);
  const [logs, setLogs] = useState<string[]>([
    "opencode-cli v1.0.4 initialized",
    "MCP: bun runtime detected",
    "MCP: uv runtime detected",
    "Connected to Anthropic API...",
    "Ready for agentic tasks."
  ]);

  const handleSendMessage = (content: string) => {
    const userMsg: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMsg]);

    const agentThinking: Message = { 
      role: 'agent', 
      content: "I'll handle that using the filesystem MCP server and my current LLM provider.",
      status: 'thinking'
    };
    setMessages(prev => [...prev, agentThinking]);

    setTimeout(() => {
      setLogs(prev => [...prev, `Executing MCP command: filesystem.read_dir(".")`]);
      setLogs(prev => [...prev, "MCP Response: [src, package.json, ...]"]);
      
      setTimeout(() => {
        setLogs(prev => [...prev, "Task completed successfully."]);
        
        setMessages(prev => {
          const newMsgs = [...prev];
          const last = newMsgs[newMsgs.length - 1];
          last.content = "I've analyzed your project using the MCP servers. I'm ready to proceed with the implementation.";
          last.status = 'done';
          return newMsgs;
        });
      }, 1500);
    }, 1000);
  };

  return (
    <div className="h-screen w-full flex bg-[#0c0c0c] overflow-hidden relative">
      <FileExplorer />
      
      <div className="flex-1 flex flex-col min-w-0">
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={70} minSize={30}>
            <div className="relative h-full">
              <ChatInterface 
                messages={messages} 
                onSendMessage={handleSendMessage} 
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 z-20 bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                onClick={() => setIsSettingsOpen(true)}
              >
                <SettingsIcon size={18} />
              </Button>
            </div>
          </ResizablePanel>
          
          <ResizableHandle className="bg-zinc-800 h-1 hover:bg-indigo-500 transition-colors" />
          
          <ResizablePanel defaultSize={30} minSize={15}>
            <Terminal logs={logs} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default Index;