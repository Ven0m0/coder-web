// Plugin system for OpenCode CLI with security enhancements
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

// Whitelisted plugin sources for security
const APPROVED_PLUGIN_SOURCES = [
  '/plugins/example-plugin',
  // Add more approved local plugins here
  // External sources should be carefully vetted
];

// Plugin registry
const plugins: Map<string, Plugin> = new Map();

// Validate plugin source against whitelist
function isPluginSourceApproved(source: string): boolean {
  // For local plugins, check if in approved list
  if (source.startsWith('/plugins/')) {
    return APPROVED_PLUGIN_SOURCES.includes(source);
  }
  
  // For external sources, implement additional validation
  // This could include domain whitelisting, signature verification, etc.
  // For now, we'll be restrictive and only allow local plugins
  return false;
}

export async function loadPlugin(pluginPath: string): Promise<void> {
  try {
    // Security check: Validate plugin source
    if (!isPluginSourceApproved(pluginPath)) {
      console.warn(`Plugin loading blocked for unapproved source: ${pluginPath}`);
      throw new Error("Plugin source not approved");
    }

    // Create a secure context for plugin loading
    const pluginModule = await import(/* @vite-ignore */ pluginPath);
    const plugin: Plugin = pluginModule.default;
    
    if (!plugin.name) {
      throw new Error("Plugin must have a name");
    }
    
    // Validate plugin structure
    if (plugin.commands && !Array.isArray(plugin.commands)) {
      throw new Error("Plugin commands must be an array");
    }
    
    if (plugin.agents && !Array.isArray(plugin.agents)) {
      throw new Error("Plugin agents must be an array");
    }
    
    if (plugin.skills && !Array.isArray(plugin.skills)) {
      throw new Error("Plugin skills must be an array");
    }
    
    plugins.set(plugin.name, plugin);
    console.log(`Loaded plugin: ${plugin.name}`);
  } catch (error) {
    console.error(`Failed to load plugin from ${pluginPath}:`, error);
    throw new Error(`Plugin loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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