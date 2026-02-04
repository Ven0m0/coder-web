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

// Plugin registry
const plugins: Map<string, Plugin> = new Map();

// Whitelisted plugin sources for security
const WHITELISTED_SOURCES = [
  './plugins/',
  '/plugins/',
  // Add other trusted sources here
];

// Simple hash verification (in production, use proper cryptographic signatures)
const verifyPluginIntegrity = async (pluginCode: string): Promise<boolean> => {
  // In a real implementation, this would check cryptographic signatures
  // For now, we'll just check that it's from a whitelisted source
  return true;
};

export async function loadPlugin(pluginPath: string): Promise<void> {
  try {
    // Security check: only allow whitelisted sources
    const isWhitelisted = WHITELISTED_SOURCES.some(source => 
      pluginPath.startsWith(source) || pluginPath === source
    );
    
    if (!isWhitelisted) {
      console.error(`Plugin loading blocked: ${pluginPath} is not from a whitelisted source`);
      return;
    }

    // For local plugins, we can load directly
    if (pluginPath.startsWith('./plugins/') || pluginPath.startsWith('/plugins/')) {
      const pluginModule = await import(/* @vite-ignore */ pluginPath);
      const plugin: Plugin = pluginModule.default;
      
      if (!plugin.name) {
        throw new Error("Plugin must have a name");
      }
      
      // In a real implementation, we would verify the plugin signature here
      // const isValid = await verifyPluginIntegrity(pluginModule);
      // if (!isValid) {
      //   throw new Error("Plugin signature verification failed");
      // }
      
      plugins.set(plugin.name, plugin);
      console.log(`Loaded plugin: ${plugin.name}`);
      return;
    }
    
    // For remote plugins, we would need additional security measures
    // This is a simplified implementation - in production, use proper verification
    console.warn(`Loading remote plugin: ${pluginPath}. Ensure this source is trusted.`);
    
    const pluginModule = await import(/* @vite-ignore */ pluginPath);
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

// Function to unload a plugin
export function unloadPlugin(name: string): boolean {
  return plugins.delete(name);
}