"use client";

import React, { useState } from 'react';
import { Plus, Server, Trash2, Play, Square, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type MCPRuntime = 'bun' | 'uv';

export interface MCPServer {
  id: string;
  name: string;
  runtime: MCPRuntime;
  command: string;
  status: 'running' | 'stopped' | 'error';
}

const MCPManager = () => {
  const [servers, setServers] = useState<MCPServer[]>([
    { id: '1', name: 'Filesystem', runtime: 'bun', command: 'mcp-server-filesystem', status: 'running' },
    { id: '2', name: 'PostgreSQL', runtime: 'uv', command: 'mcp-server-postgres', status: 'stopped' }
  ]);

  const [newName, setNewName] = useState('');
  const [newRuntime, setNewRuntime] = useState<MCPRuntime>('bun');
  const [newCommand, setNewCommand] = useState('');

  const addServer = () => {
    if (!newName || !newCommand) return;
    const server: MCPServer = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      runtime: newRuntime,
      command: newCommand,
      status: 'stopped'
    };
    setServers([...servers, server]);
    setNewName('');
    setNewCommand('');
  };

  const removeServer = (id: string) => {
    setServers(servers.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="text-indigo-400" size={20} />
          <h3 className="text-sm font-semibold text-zinc-200">MCP Servers</h3>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-500">
          Model Context Protocol
        </Badge>
      </div>

      <div className="grid gap-3">
        {servers.map(server => (
          <div key={server.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${server.status === 'running' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-600'}`} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-300">{server.name}</span>
                  <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-zinc-800 text-zinc-400 border-none">
                    {server.runtime}
                  </Badge>
                </div>
                <code className="text-[10px] text-zinc-500 font-mono">{server.command}</code>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-300">
                {server.status === 'running' ? <Square size={14} /> : <Play size={14} />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-400" onClick={() => removeServer(server.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Add New Server</h4>
        <div className="grid grid-cols-2 gap-3">
          <Input 
            placeholder="Server Name" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="bg-zinc-950 border-zinc-800 text-xs h-9"
          />
          <Select value={newRuntime} onValueChange={(v: MCPRuntime) => setNewRuntime(v)}>
            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-xs h-9">
              <SelectValue placeholder="Runtime" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
              <SelectItem value="bun">Bun</SelectItem>
              <SelectItem value="uv">UV (Python)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input 
          placeholder="Command (e.g. bunx @modelcontextprotocol/server-everything)" 
          value={newCommand}
          onChange={(e) => setNewCommand(e.target.value)}
          className="bg-zinc-950 border-zinc-800 text-xs h-9"
        />
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 gap-2" onClick={addServer}>
          <Plus size={14} />
          Register MCP Server
        </Button>
      </div>
    </div>
  );
};

export default MCPManager;