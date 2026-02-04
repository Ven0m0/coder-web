// Plugin system for OpenCode CLI
export interface Plugin {
  name: string;
  version: string;
  description: string;
  commands?: Command[];
  agents?: Agent[];
  skills?: Skill[];
}

export interface Command {
  name: string;
  description: string;
  execute: (args: string[]) => Promise<void>;
}

export interface Agent {
  name: string;
  description: string;
  run: (task: string) => Promise<string>;
}

export interface Skill {
  name: string;
  description: string;
  execute: (input: string) => Promise<string>;
}

// Plugin registry
const plugins: Map<string, Plugin> = new Map();

export async function loadPlugin(pluginPath: string): Promise<void> {
  try {
    const pluginModule = await import(pluginPath);
    const plugin: Plugin = pluginModule.default;
    
    if (!plugin.name) {
      throw new Error("Plugin must have a name");
    }
    
    plugins.set(plugin.name, plugin);
    console.log(`Loaded plugin: ${plugin.name}`);
  } catch (error) {
    console.error(`Failed to load plugin from ${pluginPath}:`, error);
  }
}

export function getPlugin(name: string): Plugin | undefined {
  return plugins.get(name);
}

export function getAllPlugins(): Plugin[] {
  return Array.from(plugins.values());
}

export function getCommands(): Command[] {
  return Array.from(plugins.values()).flatMap(plugin => plugin.commands || []);
}

export function getAgents(): Agent[] {
  return Array.from(plugins.values()).flatMap(plugin => plugin.agents || []);
}

export function getSkills(): Skill[] {
  return Array.from(plugins.values()).flatMap(plugin => plugin.skills || []);
}