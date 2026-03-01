// Example plugin for OpenCode CLI
import type { Agent, Command, Plugin, Skill } from "@/plugins/index";

// Example command
const exampleCommand: Command = {
  name: "hello",
  description: "Say hello from the example plugin",
  execute: async (args: string[]) => {
    console.log("Hello from the example plugin!");
    if (args.length > 0) {
      console.log("Arguments:", args.join(" "));
    }
  },
};

// Example agent
const exampleAgent: Agent = {
  name: "ExampleAgent",
  description: "An example agent that echoes input",
  run: async (task: string) => {
    return `Echo: ${task}`;
  },
};

// Example skill
const exampleSkill: Skill = {
  name: "TextFormatter",
  description: "Formats text with a prefix",
  execute: async (input: string) => {
    return `[FORMATTED] ${input}`;
  },
};

// Plugin definition
const examplePlugin: Plugin = {
  name: "example-plugin",
  version: "1.0.0",
  description: "An example plugin demonstrating the plugin system",
  commands: [exampleCommand],
  agents: [exampleAgent],
  skills: [exampleSkill],
};

export default examplePlugin;
