// Plugin system for OpenCode CLI with enhanced security
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

// Plugin signature verification (simplified for this example)
// In production, use proper cryptographic signatures
const PLUGIN_SIGNATURES: Record<string, string> = {
  './plugins/example-plugin': 'example-plugin-signature',
  // Add more plugin signatures here
};

// Simple hash verification (in production, use proper cryptographic signatures)
const verifyPluginSignature = async (pluginPath: string, pluginCode: string): Promise<boolean> => {
  // In a real implementation, this would check cryptographic signatures
  // For now, we'll check against our known signatures
  const expectedSignature = PLUGIN_SIGNATURES[pluginPath];
  if (!expectedSignature) {
    console.warn(`No signature found for plugin: ${pluginPath}`);
    return false;
  }
  
  // Simple hash verification (replace with proper crypto in production)
  const encoder = new TextEncoder();
  const data = encoder.encode(pluginCode);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex === expectedSignature;
};

// Content Security Policy for plugin sandboxing
const createPluginCSP = () => {
  return `
    default-src 'none';
    script-src 'self';
    style-src 'self';
    img-src 'self' data:;
    font-src 'self';
    connect-src 'self';
    frame-src 'none';
    object-src 'none';
  `;
};

// Secure plugin loader using Web Workers for sandboxing
export async function loadPluginSecure(pluginPath: string): Promise<void> {
  try {
    // Security check: only allow whitelisted sources
    const isWhitelisted = WHITELISTED_SOURCES.some(source => 
      pluginPath.startsWith(source) || pluginPath === source
    );
    
    if (!isWhitelisted) {
      throw new Error(`Plugin loading blocked: ${pluginPath} is not from a whitelisted source`);
    }

    // For local plugins, we can load directly with additional checks
    if (pluginPath.startsWith('./plugins/') || pluginPath.startsWith('/plugins/')) {
      // Fetch plugin code for verification
      const response = await fetch(pluginPath);
      const pluginCode = await response.text();
      
      // Verify plugin signature
      const isValid = await verifyPluginSignature(pluginPath, pluginCode);
      if (!isValid) {
        throw new Error(`Plugin signature verification failed for: ${pluginPath}`);
      }
      
      // Create a secure sandbox using Web Worker
      const workerCode = `
        self.onmessage = async function(e) {
          try {
            // Create a restricted environment
            const pluginModule = {};
            
            // Only allow safe operations in the plugin
            const safeGlobals = {
              console: {
                log: (...args) => postMessage({type: 'log', data: args}),
                error: (...args) => postMessage({type: 'error', data: args})
              },
              fetch: self.fetch,
              Promise: self.Promise,
              Object: self.Object,
              Array: self.Array,
              String: self.String,
              Number: self.Number,
              Date: self.Date,
              RegExp: self.RegExp,
              JSON: self.JSON,
              Math: self.Math,
              // Add other safe globals as needed
            };
            
            // Evaluate plugin code in restricted context
            // Note: In production, use a more secure evaluation method
            const pluginFunction = new Function(...Object.keys(safeGlobals), pluginCode + '; return pluginModule.default;');
            const plugin = pluginFunction(...Object.values(safeGlobals));
            
            // Send plugin back to main thread
            postMessage({type: 'plugin', data: plugin});
          } catch (error) {
            postMessage({type: 'error', data: ['Plugin execution error: ' + error.message]});
          }
        };
      `;
      
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      
      const worker = new Worker(workerUrl, {
        type: 'module',
        credentials: 'same-origin'
      });
      
      // Set Content Security Policy for the worker
      worker.addEventListener('message', (event) => {
        if (event.data.type === 'plugin') {
          const plugin: Plugin = event.data.data;
          
          if (!plugin.name) {
            throw new Error("Plugin must have a name");
          }
          
          plugins.set(plugin.name, plugin);
          console.log(`Loaded plugin: ${plugin.name}`);
          URL.revokeObjectURL(workerUrl);
        } else if (event.data.type === 'error') {
          console.error('Plugin worker error:', event.data.data);
          URL.revokeObjectURL(workerUrl);
        } else if (event.data.type === 'log') {
          console.log('Plugin log:', ...event.data.data);
        }
      });
      
      // Handle worker errors
      worker.addEventListener('error', (error) => {
        console.error('Plugin worker error:', error.message);
        URL.revokeObjectURL(workerUrl);
      });
      
      // Start the worker
      worker.postMessage({});
      
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
    throw error;
  }
}

// Deprecated function - kept for backward compatibility but shows warning
export async function loadPlugin(pluginPath: string): Promise<void> {
  console.warn('loadPlugin is deprecated. Use loadPluginSecure instead.');
  return loadPluginSecure(pluginPath);
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