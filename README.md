# OpenCode CLI

A powerful agentic coding interface with Claude Code-style plugin support, powered by Bun and Biome.

## Features

- **Bun Runtime**: Lightning-fast JavaScript/TypeScript runtime
- **Biome Linting**: 15x faster than ESLint, 25x faster than Prettier
- **Plugin System**: Claude Code-compatible plugins for commands, agents, and skills
- **Token Optimization**: ZON and TOON formats for reduced LLM costs
- **MCP Support**: Model Context Protocol integration for tool usage
- **Docker Deployment**: Easy self-hosting with Docker

## Quick Start

```bash
# Install dependencies (using Bun)
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

## Plugin System

OpenCode CLI supports a Claude Code-compatible plugin system:

1. **Commands**: Extend CLI functionality with custom commands
2. **Agents**: Add specialized AI agents for different tasks
3. **Skills**: Reusable components that can be shared between agents

Plugins can be added through the UI or by placing them in the `plugins` directory.

## Deployment

### Docker (Recommended)
```bash
docker-compose up -d --build
```

### Direct with Bun
```bash
bun install
bun run build
bunx serve dist -p 80
```

## Development

- `bun run dev` - Start development server
- `bun run lint` - Check for linting errors
- `bun run lint:fix` - Fix linting errors automatically
- `bun run format` - Format code with Biome
- `bun run build` - Build for production

## Self-Hosting

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed self-hosting instructions.

## Technologies

- [Bun](https://bun.sh/) - JavaScript runtime
- [Biome](https://biomejs.dev/) - Linter and formatter
- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components