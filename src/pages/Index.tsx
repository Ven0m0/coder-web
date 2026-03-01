"use client";

import { Settings as SettingsIcon, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import FileExplorer from "@/components/FileExplorer";
import SettingsPanel from "@/components/SettingsPanel";
import Terminal from "@/components/Terminal";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { tokenOptimizer } from "@/utils/tokenOptimizer";

interface Message {
  role: "user" | "agent";
  content: string;
  status?: "thinking" | "executing" | "done";
  optimized?: boolean;
}

// Sanitize user messages to prevent XSS
const sanitizeMessage = (content: string): string => {
  const div = document.createElement("div");
  div.textContent = content;
  return div.innerHTML;
};

const Index = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      content:
        "Hello! I'm your OpenCode agent. I'm currently configured with Jules (Google) and have ripgrep, fd, ast-grep, and gh-cli ready. How can I help you today?",
    },
  ]);
  const [logs, setLogs] = useState<string[]>([
    "opencode-cli v1.0.4 initialized",
    "Tools detected: rg, fd, ast-grep, repomix, gh",
    "MCP: bun runtime detected",
    "MCP: uv runtime detected",
    "Connected to Jules (Google) API...",
    "Ready for agentic tasks.",
  ]);

  // Add security headers
  useEffect(() => {
    // Set additional security headers
    const setSecurityHeaders = () => {
      // X-Content-Type-Options
      const contentTypeOptions = document.createElement("meta");
      contentTypeOptions.httpEquiv = "X-Content-Type-Options";
      contentTypeOptions.content = "nosniff";
      document.head.appendChild(contentTypeOptions);

      // X-Frame-Options
      const frameOptions = document.createElement("meta");
      frameOptions.httpEquiv = "X-Frame-Options";
      frameOptions.content = "DENY";
      document.head.appendChild(frameOptions);

      // Referrer-Policy
      const referrerPolicy = document.createElement("meta");
      referrerPolicy.httpEquiv = "Referrer-Policy";
      referrerPolicy.content = "no-referrer";
      document.head.appendChild(referrerPolicy);
    };

    setSecurityHeaders();
  }, []);

  const handleSendMessage = async (content: string) => {
    // Sanitize user input
    const sanitizedContent = sanitizeMessage(content);

    const userMsg: Message = {
      role: "user",
      content: sanitizedContent,
      optimized: sanitizedContent !== tokenOptimizer.optimizeContent(sanitizedContent),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Get the current provider
    const currentProvider = localStorage.getItem("opencode_provider") || "jules";

    // In a real implementation, we would use the API key here
    // For now, we'll just simulate the process
    const agentThinking: Message = {
      role: "agent",
      content: `I'll handle that using the ${currentProvider} provider and filesystem MCP server.`,
      status: "thinking",
    };

    setMessages((prev) => [...prev, agentThinking]);

    // Simulate agent processing with sanitized logs
    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        `Executing search for: "${sanitizedContent.substring(0, 30)}..."`,
      ]);
      setLogs((prev) => [...prev, "Found relevant files in src/components/"]);

      setTimeout(() => {
        setLogs((prev) => [...prev, "Task analysis completed successfully."]);
        setMessages((prev) => {
          const newMsgs = [...prev];
          const last = newMsgs[newMsgs.length - 1];
          last.content =
            "I've analyzed the codebase and identified the relevant components. I'm ready to proceed with the implementation.";
          last.status = "done";
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
              <ChatInterface messages={messages} onSendMessage={handleSendMessage} />
              <div className="absolute top-4 right-24 z-20 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 text-xs h-8 px-2"
                  onClick={async () => {
                    const stats = tokenOptimizer.getCacheStats();
                    setLogs((prev) => [
                      ...prev,
                      `Token cache stats: ${stats.size}/${stats.maxSize} items`,
                    ]);
                  }}
                >
                  <Zap size={14} className="mr-1" />
                  Cache Stats
                </Button>
              </div>
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
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default Index;
