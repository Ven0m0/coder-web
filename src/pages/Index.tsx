"use client";

import React, { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import Terminal from '@/components/Terminal';
import FileExplorer from '@/components/FileExplorer';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

interface Message {
  role: 'user' | 'agent';
  content: string;
  status?: 'thinking' | 'executing' | 'done';
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'agent', content: "Hello! I'm your OpenCode agent. I can help you write code, run commands, and manage your project. What should we build today?" }
  ]);
  const [logs, setLogs] = useState<string[]>([
    "opencode-cli v1.0.4 initialized",
    "Environment: production",
    "Connected to LLM gateway..."
  ]);

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMsg: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMsg]);

    // Simulate agent thinking
    const agentThinking: Message = { 
      role: 'agent', 
      content: "I'll help you with that. Let me analyze the project structure and run some commands.",
      status: 'thinking'
    };
    setMessages(prev => [...prev, agentThinking]);

    // Simulate CLI activity
    setTimeout(() => {
      setLogs(prev => [...prev, `Analyzing request: "${content}"`]);
      setLogs(prev => [...prev, "ls -R src/"]);
      setLogs(prev => [...prev, "Reading src/App.tsx..."]);
      
      setTimeout(() => {
        setLogs(prev => [...prev, "npm run build:check"]);
        setLogs(prev => [...prev, "Build successful. No errors found."]);
        
        setMessages(prev => {
          const newMsgs = [...prev];
          const last = newMsgs[newMsgs.length - 1];
          last.content = "I've analyzed the project. Everything looks good. I'm ready to implement the changes you requested. I'll start by updating the components.";
          last.status = 'done';
          return newMsgs;
        });
      }, 1500);
    }, 1000);
  };

  return (
    <div className="h-screen w-full flex bg-[#0c0c0c] overflow-hidden">
      <FileExplorer />
      
      <div className="flex-1 flex flex-col min-w-0">
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={70} minSize={30}>
            <ChatInterface 
              messages={messages} 
              onSendMessage={handleSendMessage} 
            />
          </ResizablePanel>
          
          <ResizableHandle className="bg-zinc-800 h-1 hover:bg-indigo-500 transition-colors" />
          
          <ResizablePanel defaultSize={30} minSize={15}>
            <Terminal logs={logs} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;