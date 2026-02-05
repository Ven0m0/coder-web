# OpenCode CLI

A powerful agentic coding interface with Claude Code-style plugin support, powered by Bun and Biome.

## Features

- **Bun Runtime**: Lightning-fast JavaScript/TypeScript runtime
- **Biome Linting**: 15x faster than ESLint, 25x faster than Prettier
- **Plugin System**: Claude Code-compatible plugins for commands, agents, and skills
- **Token Optimization**: ZON and TOON formats for reduced LLM costs
- **MCP Support**: Model Context Protocol integration for tool usage
- **Docker Deployment**: Easy self-hosting with Docker (powered by Bun)

## Quick Start

```bash
# Install dependencies (using Bun)
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

## Deployment

### Docker (Recommended)
```bash
docker-compose up -d --build
```

### Direct with Bun
```bash
bun install
bun run build
bun run preview
```

## Development

- `bun run dev` - Start development server
- `bun run lint` - Check for linting errors
- `bun run lint:fix` - Fix linting errors automatically
- `bun run format` - Format code with Biome
- `bun run build` - Build for production

## Technologies

- [Bun](https://bun.sh/) - JavaScript runtime
- [Biome](https://biomejs.dev/) - Linter and formatter
- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling