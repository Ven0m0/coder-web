"use client";

import React from 'react';
import { Wrench, CheckCircle2, AlertCircle, Github, Search, FileSearch, Code2, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const TOOLS = [
  { id: 'rg', name: 'ripgrep', description: 'Fast line-oriented search', icon: Search, status: 'installed' },
  { id: 'fd', name: 'fd', description: 'Simple, fast alternative to find', icon: FileSearch, status: 'installed' },
  { id: 'ast-grep', name: 'ast-grep', description: 'Structural code search/rewrite', icon: Code2, status: 'installed' },
  { id: 'repomix', name: 'repomix', description: 'Repository context mixer', icon: Package, status: 'installed' },
  { id: 'gh', name: 'gh-cli', description: 'GitHub Command Line Interface', icon: Github, status: 'installed' }
];

const SystemTools = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="text-indigo-400" size={20} />
          <h3 className="text-sm font-semibold text-zinc-200">System Tools</h3>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-500">
          Agent Dependencies
        </Badge>
      </div>

      <div className="grid gap-3">
        {TOOLS.map(tool => (
          <div key={tool.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center">
                <tool.icon size={16} className="text-zinc-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-300">{tool.name}</span>
                  {tool.status === 'installed' ? (
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  ) : (
                    <AlertCircle size={12} className="text-amber-500" />
                  )}
                </div>
                <p className="text-[10px] text-zinc-500">{tool.description}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-[9px] bg-zinc-800 text-zinc-400 border-none">
              v1.0.0
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemTools;