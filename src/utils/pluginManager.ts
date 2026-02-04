import { Skill, Command, Agent, PluginManifest } from '@/types/plugin';

class PluginManager {
  private skills: Map<string, Skill> = new Map();
  private commands: Map<string, Command> = new Map();
  private agents: Map<string, Agent> = new Map();
  private readonly STORAGE_KEY = 'opencode_plugins';

  constructor() {
    this.loadFromStorage();
  }

  // Storage management
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        
        data.skills?.forEach((skill: Skill) => {
          this.skills.set(skill.id, { ...skill, createdAt: new Date(skill.createdAt), updatedAt: new Date(skill.updatedAt) });
        });
        
        data.commands?.forEach((cmd: Command) => {
          this.commands.set(cmd.id, cmd);
        });
        
        data.agents?.forEach((agent: Agent) => {
          this.agents.set(agent.id, agent);
        });
      }
    } catch (error) {
      console.error('Failed to load plugins:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        skills: Array.from(this.skills.values()),
        commands: Array.from(this.commands.values()),
        agents: Array.from(this.agents.values())
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save plugins:', error);
    }
  }

  // Skill management
  addSkill(skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>): Skill {
    const newSkill: Skill = {
      ...skill,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.skills.set(newSkill.id, newSkill);
    this.saveToStorage();
    return newSkill;
  }

  updateSkill(id: string, updates: Partial<Skill>): Skill | null {
    const skill = this.skills.get(id);
    if (!skill) return null;
    
    const updated = { ...skill, ...updates, updatedAt: new Date() };
    this.skills.set(id, updated);
    this.saveToStorage();
    return updated;
  }

  removeSkill(id: string): boolean {
    const result = this.skills.delete(id);
    this.saveToStorage();
    return result;
  }

  getSkill(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  getEnabledSkills(): Skill[] {
    return Array.from(this.skills.values()).filter(s => s.enabled);
  }

  toggleSkill(id: string): boolean {
    const skill = this.skills.get(id);
    if (!skill) return false;
    
    skill.enabled = !skill.enabled;
    skill.updatedAt = new Date();
    this.saveToStorage();
    return skill.enabled;
  }

  // Command management
  addCommand(command: Omit<Command, 'id'>): Command {
    const newCommand: Command = {
      ...command,
      id: this.generateId()
    };
    this.commands.set(newCommand.id, newCommand);
    this.saveToStorage();
    return newCommand;
  }

  updateCommand(id: string, updates: Partial<Command>): Command | null {
    const command = this.commands.get(id);
    if (!command) return null;
    
    const updated = { ...command, ...updates };
    this.commands.set(id, updated);
    this.saveToStorage();
    return updated;
  }

  removeCommand(id: string): boolean {
    const result = this.commands.delete(id);
    this.saveToStorage();
    return result;
  }

  getCommand(id: string): Command | undefined {
    return this.commands.get(id);
  }

  getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  getEnabledCommands(): Command[] {
    return Array.from(this.commands.values()).filter(c => c.enabled);
  }

  toggleCommand(id: string): boolean {
    const command = this.commands.get(id);
    if (!command) return false;
    
    command.enabled = !command.enabled;
    this.saveToStorage();
    return command.enabled;
  }

  // Agent management
  addAgent(agent: Omit<Agent, 'id'>): Agent {
    const newAgent: Agent = {
      ...agent,
      id: this.generateId()
    };
    this.agents.set(newAgent.id, newAgent);
    this.saveToStorage();
    return newAgent;
  }

  updateAgent(id: string, updates: Partial<Agent>): Agent | null {
    const agent = this.agents.get(id);
    if (!agent) return null;
    
    const updated = { ...agent, ...updates };
    this.agents.set(id, updated);
    this.saveToStorage();
    return updated;
  }

  removeAgent(id: string): boolean {
    const result = this.agents.delete(id);
    this.saveToStorage();
    return result;
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getEnabledAgents(): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.enabled);
  }

  toggleAgent(id: string): boolean {
    const agent = this.agents.get(id);
    if (!agent) return false;
    
    agent.enabled = !agent.enabled;
    this.saveToStorage();
    return agent.enabled;
  }

  // Plugin import/export
  exportPlugin(id: string, type: 'skill' | 'command' | 'agent'): string | null {
    let data;
    switch (type) {
      case 'skill':
        data = this.skills.get(id);
        break;
      case 'command':
        data = this.commands.get(id);
        break;
      case 'agent':
        data = this.agents.get(id);
        break;
    }
    
    if (!data) return null;
    
    return JSON.stringify(data, null, 2);
  }

  importPlugin(json: string): { success: boolean; error?: string; type?: string } {
    try {
      const parsed = JSON.parse(json);
      
      // Detect type based on structure
      if (parsed.instructions && parsed.scripts !== undefined) {
        const skill: Skill = {
          ...parsed,
          id: this.generateId(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.skills.set(skill.id, skill);
        this.saveToStorage();
        return { success: true, type: 'skill' };
      } else if (parsed.command && parsed.category) {
        const command: Command = {
          ...parsed,
          id: this.generateId()
        };
        this.commands.set(command.id, command);
        this.saveToStorage();
        return { success: true, type: 'command' };
      } else if (parsed.systemPrompt && parsed.tools) {
        const agent: Agent = {
          ...parsed,
          id: this.generateId()
        };
        this.agents.set(agent.id, agent);
        this.saveToStorage();
        return { success: true, type: 'agent' };
      }
      
      return { success: false, error: 'Unknown plugin type' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Invalid JSON' };
    }
  }

  // Utility
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getStats() {
    return {
      skills: {
        total: this.skills.size,
        enabled: this.getEnabledSkills().length
      },
      commands: {
        total: this.commands.size,
        enabled: this.getEnabledCommands().length
      },
      agents: {
        total: this.agents.size,
        enabled: this.getEnabledAgents().length
      }
    };
  }

  clearAll(): void {
    this.skills.clear();
    this.commands.clear();
    this.agents.clear();
    this.saveToStorage();
  }
}

// Export singleton instance
export const pluginManager = new PluginManager();