"use client";

import { AlertTriangle, CheckCircle, Package, Play, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getAgents,
  getAllPlugins,
  getCommands,
  getSkills,
  loadPluginSecure,
  unloadPlugin,
} from "@/plugins/index";

const PluginManager = () => {
  const [plugins, setPlugins] = useState<any[]>([]);
  const [commands, setCommands] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [newPluginUrl, setNewPluginUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const loadPlugins = () => {
    setPlugins(getAllPlugins());
    setCommands(getCommands());
    setAgents(getAgents());
    setSkills(getSkills());
  };

  useEffect(() => {
    loadPlugins();
    // biome-ignore lint/correctness/useExhaustiveDependencies: loadPlugins is stable but not a hook dependency
  }, []);

  const handleAddPlugin = async () => {
    if (!newPluginUrl) return;

    setLoading(true);
    try {
      // Use the secure plugin loading mechanism with persistence
      await loadPluginSecure(newPluginUrl, true);
      toast.success(`Plugin added successfully from: ${newPluginUrl}`);
      setNewPluginUrl("");
      // Refresh the plugin list
      loadPlugins();
    } catch (error) {
      console.error("Failed to add plugin:", error);
      toast.error(
        `Failed to add plugin: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePlugin = (pluginName: string) => {
    const success = unloadPlugin(pluginName);
    if (success) {
      toast.success(`Plugin ${pluginName} removed`);
      loadPlugins();
    } else {
      toast.error(`Failed to remove plugin: ${pluginName}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="text-indigo-400" size={20} />
          <h3 className="text-sm font-semibold text-zinc-200">Plugin Manager</h3>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-500"
        >
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
              <Label
                htmlFor="plugin-url"
                className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest"
              >
                Plugin URL or Path
              </Label>
              <div className="flex gap-2">
                <Input
                  id="plugin-url"
                  value={newPluginUrl}
                  onChange={(e) => setNewPluginUrl(e.target.value)}
                  placeholder="Enter plugin URL or local path"
                  className="bg-zinc-950 border-zinc-800 text-zinc-200 text-xs flex-1"
                  disabled={loading}
                />
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9"
                  onClick={handleAddPlugin}
                  disabled={loading || !newPluginUrl}
                >
                  {loading ? (
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
            <div className="flex items-center gap-2 text-[10px] text-amber-500 bg-amber-500/10 p-2 rounded">
              <AlertTriangle size={12} />
              <span>
                Only plugins from trusted sources will be loaded. All plugins are sandboxed for
                security.
              </span>
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
                  <div
                    key={plugin.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-300">{plugin.name}</span>
                        <Badge
                          variant="secondary"
                          className="text-[9px] h-4 px-1.5 bg-zinc-800 text-zinc-400 border-none"
                        >
                          v{plugin.version}
                        </Badge>
                        <CheckCircle size={12} className="text-emerald-500" />
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
                    <div
                      key={command.name}
                      className="flex items-center gap-2 p-2 rounded bg-zinc-900/50 border border-zinc-800"
                    >
                      <code className="text-[10px] text-zinc-300 font-mono flex-1">
                        /{command.name}
                      </code>
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
                    <div
                      key={agent.name}
                      className="p-2 rounded bg-zinc-900/50 border border-zinc-800"
                    >
                      <div className="text-xs font-medium text-zinc-300">{agent.name}</div>
                      <p className="text-[10px] text-zinc-500 mt-1">{agent.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-zinc-500 text-center py-2">No agents available</p>
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
                <div
                  key={skill.name}
                  className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800"
                >
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
