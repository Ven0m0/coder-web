"use client";

import React, { useState } from 'react';
import { 
  Puzzle, 
  Upload, 
  Download, 
  Trash2, 
  Plus, 
  Search,
  Filter,
  Sparkles,
  Terminal,
  Bot,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { pluginManager } from '@/utils/pluginManager';
import { Skill, Command, Agent } from '@/types/plugin';
import { showSuccess, showError } from '@/utils/toast';

const PluginManager = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [activeTab, setActiveTab] = useState('skills');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadContent, setUploadContent] = useState('');
  
  const skills = pluginManager.getAllSkills();
  const commands = pluginManager.getAllCommands();
  const agents = pluginManager.getAllAgents();
  const stats = pluginManager.getStats();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setUploadContent(content);
    };
    reader.readAsText(file);
  };

  const handleImportPlugin = () => {
    if (!uploadContent) return;
    
    const result = pluginManager.importPlugin(uploadContent);
    if (result.success) {
      showSuccess(`Successfully imported ${result.type}`);
      setUploadContent('');
      setShowUploadDialog(false);
    } else {
      showError(result.error || 'Failed to import plugin');
    }
  };

  const handleExportPlugin = (id: string, type: 'skill' | 'command' | 'agent') => {
    const json = pluginManager.exportPlugin(id, type);
    if (!json) return;

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showSuccess(`Exported ${type}`);
  };

  const handleToggle = (id: string, type: 'skill' | 'command' | 'agent') => {
    let enabled;
    switch (type) {
      case 'skill':
        enabled = pluginManager.toggleSkill(id);
        break;
      case 'command':
        enabled = pluginManager.toggleCommand(id);
        break;
      case 'agent':
        enabled = pluginManager.toggleAgent(id);
        break;
    }
    showSuccess(`${type} ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleDelete = (id: string, type: 'skill' | 'command' | 'agent') => {
    let success;
    switch (type) {
      case 'skill':
        success = pluginManager.removeSkill(id);
        break;
      case 'command':
        success = pluginManager.removeCommand(id);
        break;
      case 'agent':
        success = pluginManager.removeAgent(id);
        break;
    }
    
    if (success) {
      showSuccess(`${type} deleted`);
    } else {
      showError(`Failed to delete ${type}`);
    }
  };

  const filteredSkills = skills.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCommands = commands.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Puzzle className="text-indigo-400" size={20} />
          <h3 className="text-sm font-semibold text-zinc-200">Plugin Manager</h3>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-500">
          Claude Code Compatible
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Sparkles size={18} className="text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-zinc-100">{stats.skills.total}</div>
                <div className="text-xs text-zinc-500">Skills ({stats.skills.enabled} active)</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Terminal size={18} className="text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-zinc-100">{stats.commands.total}</div>
                <div className="text-xs text-zinc-500">Commands ({stats.commands.enabled} active)</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Bot size={18} className="text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-zinc-100">{stats.agents.total}</div>
                <div className="text-xs text-zinc-500">Agents ({stats.agents.enabled} active)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={16} />
          <Input
            placeholder="Search plugins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-900 border-zinc-800 text-zinc-200 pl-10 h-9"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={showFilter ? "bg-zinc-800 text-zinc-200" : "text-zinc-500"}
          onClick={() => setShowFilter(!showFilter)}
        >
          <Filter size={18} />
        </Button>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-9">
              <Upload size={16} />
              Import Plugin
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
            <DialogHeader>
              <DialogTitle>Import Plugin</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-2 block">Upload JSON File</label>
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-2 block">Or paste JSON content</label>
                <Textarea
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  placeholder="Paste plugin JSON here..."
                  className="bg-zinc-950 border-zinc-800 min-h-[150px] font-mono text-xs"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleImportPlugin}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={!uploadContent}
                >
                  Import
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadContent('');
                    setShowUploadDialog(false);
                  }}
                  className="bg-zinc-800 border-zinc-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plugin Lists */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-zinc-900 border-zinc-800">
          <TabsTrigger value="skills" className="data-[state=active]:bg-zinc-800">
            <Sparkles size={14} className="mr-2" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="commands" className="data-[state=active]:bg-zinc-800">
            <Terminal size={14} className="mr-2" />
            Commands
          </TabsTrigger>
          <TabsTrigger value="agents" className="data-[state=active]:bg-zinc-800">
            <Bot size={14} className="mr-2" />
            Agents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-3 mt-4">
          {filteredSkills.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm">No skills found</p>
              <p className="text-xs mt-1">Import a skill to get started</p>
            </div>
          ) : (
            filteredSkills.map(skill => (
              <Card key={skill.id} className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-zinc-200">{skill.name}</h4>
                        <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-zinc-800 text-zinc-400 border-none">
                          v{skill.version}
                        </Badge>
                        {skill.enabled && (
                          <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-emerald-500/20 text-emerald-400 border-none">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mb-2">{skill.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                        <span>by {skill.author}</span>
                        <span>•</span>
                        <span>{skill.scripts?.length || 0} scripts</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-300"
                        onClick={() => handleToggle(skill.id, 'skill')}
                      >
                        {skill.enabled ? <ToggleRight size={16} className="text-emerald-400" /> : <ToggleLeft size={16} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-300"
                        onClick={() => handleExportPlugin(skill.id, 'skill')}
                      >
                        <Download size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-red-400"
                        onClick={() => handleDelete(skill.id, 'skill')}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="commands" className="space-y-3 mt-4">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Terminal size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm">No commands found</p>
              <p className="text-xs mt-1">Import a command to get started</p>
            </div>
          ) : (
            filteredCommands.map(cmd => (
              <Card key={cmd.id} className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-zinc-200">{cmd.name}</h4>
                        {cmd.enabled && (
                          <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-emerald-500/20 text-emerald-400 border-none">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mb-2">{cmd.description}</p>
                      <code className="text-[10px] bg-zinc-950 px-2 py-1 rounded text-zinc-400">
                        {cmd.command}
                      </code>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-300"
                        onClick={() => handleToggle(cmd.id, 'command')}
                      >
                        {cmd.enabled ? <ToggleRight size={16} className="text-emerald-400" /> : <ToggleLeft size={16} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-300"
                        onClick={() => handleExportPlugin(cmd.id, 'command')}
                      >
                        <Download size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-red-400"
                        onClick={() => handleDelete(cmd.id, 'command')}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="agents" className="space-y-3 mt-4">
          {filteredAgents.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Bot size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm">No agents found</p>
              <p className="text-xs mt-1">Import an agent to get started</p>
            </div>
          ) : (
            filteredAgents.map(agent => (
              <Card key={agent.id} className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-zinc-200">{agent.name}</h4>
                        {agent.model && (
                          <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-zinc-800 text-zinc-400 border-none">
                            {agent.model}
                          </Badge>
                        )}
                        {agent.enabled && (
                          <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-emerald-500/20 text-emerald-400 border-none">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mb-2">{agent.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                        <span>{agent.tools.length} tools</span>
                        {agent.temperature && (
                          <>
                            <span>•</span>
                            <span>temp: {agent.temperature}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-300"
                        onClick={() => handleToggle(agent.id, 'agent')}
                      >
                        {agent.enabled ? <ToggleRight size={16} className="text-emerald-400" /> : <ToggleLeft size={16} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-300"
                        onClick={() => handleExportPlugin(agent.id, 'agent')}
                      >
                        <Download size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-red-400"
                        onClick={() => handleDelete(agent.id, 'agent')}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PluginManager;