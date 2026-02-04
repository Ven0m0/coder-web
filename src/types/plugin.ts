export interface Skill {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  instructions: string;
  scripts?: Script[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Script {
  name: string;
  path: string;
  runtime: 'bun' | 'uv' | 'node';
  description?: string;
}

export interface Command {
  id: string;
  name: string;
  command: string;
  description: string;
  category: string;
  enabled: boolean;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  tools: string[];
  model?: string;
  temperature?: number;
  enabled: boolean;
}

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  type: 'skill' | 'command' | 'agent';
  skills?: Skill[];
  commands?: Command[];
  agents?: Agent[];
}