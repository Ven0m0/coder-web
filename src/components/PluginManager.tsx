"use client";

import React, { useState, useEffect } from 'react';
import { Upload, Package, Play, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/components/ui/use-toast";
import { getAllPlugins, getCommands, getAgents, getSkills, loadPlugin } from '@/plugins/index';

const PluginManager = () => {
  const { toast } = useToast();
  const [plugins, setPlugins] = useState<any[]>([]);
  const [commands, setCommands] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [newPluginUrl, setNewPluginUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = () => {
    setPlugins(getAllPlugins());
    setCommands(getCommands());
    setAgents(getAgents());
    setSkills(getSkills());
  };

  const handleAddPlugin = async () => {
    if (!newPluginUrl) {
      toast({
        title: "Plugin URL Required",
        description: "Please enter a plugin URL or path.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await loadPlugin(newPluginUrl);
      
      toast({
        title: "Plugin Loaded",
        description: `Successfully loaded plugin from: ${newPluginUrl}`,
      });
      
      setNewPluginUrl('');
      loadPlugins();
    } catch (error) {
      toast({
        title: "Plugin Load Failed",
        description: error instanceof Error ? error.message : "Failed to load plugin",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePlugin = (pluginName: string) => {
    // In a real implementation, this would remove the plugin
    console.log(`Removing plugin: ${pluginName}`);
    
    toast({
      title: "Plugin Removal",
      description: "In a production environment, this would remove the plugin.",
    });
    
    loadPlugins();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="text-indigo-400" size={20} />
          <h3 className="text-sm font-semibold text-zinc-200">Plugin Manager</h3>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-500">
          Claude Code Compatible
        </Badge>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Upload size={16} className="text-blue-400" />
            Add New Plugin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plugin-url" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Plugin URL or Path
              </Label>
              <div className="flex gap-2">
                <Input
                  id="plugin-url"
                  value={newPluginUrl}
                  onChange={(e) => setNewPluginUrl(e.target.value)}
                  placeholder="Enter plugin URL or local path"
                  className="bg-zinc-950 border-zinc-800 text-zinc-200 text-xs flex-1"
                />
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9"
                  onClick={handleAddPlugin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus size={14} className="mr-1" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-amber-900/20 border border-amber-800 rounded-lg">
              <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-amber-500">
                Only plugins from approved sources can be loaded. External plugins require administrator approval.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Package size={16} className="text-green-400" />
              Installed Plugins ({plugins.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {plugins.length > 0 ? (
                plugins.map((plugin) => (
                  <div key={plugin.name} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-300">{plugin.name}</span>
                        <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-zinc-800 text-zinc-400 border-none">
                          v{plugin.version}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">{plugin.description}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-zinc-500 hover:text-red-400"
                      onClick={() => handleRemovePlugin(plugin.name)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-zinc-500 text-center py-4">
                  No plugins installed. Add your first plugin above.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Play size={16} className="text-purple-400" />
                Available Commands ({commands.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {commands.length > 0 ? (
                  commands.map((command) => (
                    <div key={command.name} className="flex items-center gap-2 p-2 rounded bg-zinc-900/50 border border-zinc-800">
                      <code className="text-[10px] text-zinc-300 font-mono flex-1">/{command.name}</code>
                      <span className="text-[9px] text-zinc-500">{command.description}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-zinc-500 text-center py-2">
                    No commands available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Play size={16} className="text-amber-400" />
                Available Agents ({agents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {agents.length > 0 ? (
                  agents.map((agent) => (
                    <div key={agent.name} className="p-2 rounded bg-zinc-900/50 border border-zinc-800">
                      <div className="text-xs font-medium text-zinc-300">{agent.name}</div>
                      <p className="text-[10px] text-zinc-500 mt-1">{agent.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-zinc-500 text-center py-2">
                    No agents available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Play size={16} className="text-cyan-400" />
            Available Skills ({skills.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <div key={skill.name} className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                  <div className="text-xs font-medium text-zinc-300">{skill.name}</div>
                  <p className="text-[10px] text-zinc-500 mt-1">{skill.description}</p>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-zinc-500 col-span-3 text-center py-4">
                No skills available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginManager;