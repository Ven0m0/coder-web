# Self-Hosting Guide for OpenCode CLI (Bun + Docker + Plugins)

## Why Bun?

Bun is a modern JavaScript runtime that's significantly faster than Node.js for:
- **Package installation**: Significantly faster than alternatives like npm
- **Build times**: Optimized for Vite and modern tooling
- **Runtime performance**: Lower memory footprint and faster execution

Based on [bun.com](https://bun.com/docs/guides/ecosystem/docker) best practices.

## Why Biome?

Biome is a fast, all-in-one tool for linting and formatting JavaScript, TypeScript, and more. It's:
- **15x faster than ESLint** and **25x faster than Prettier**
- **Single binary** with no plugins to manage
- **Rust-based** for maximum performance
- **Unified configuration** for linting and formatting

## Plugin System

OpenCode CLI supports a Claude Code-compatible plugin system:
- **Commands**: Extend CLI functionality with custom commands
- **Agents**: Add specialized AI agents for different tasks
- **Skills**: Reusable components that can be shared between agents

## Prerequisites
- A VPS (DigitalOcean $6/mo, Hetzner, Linode, etc.)
- A domain name (optional but recommended)
- SSH access to your VPS
- Docker and Docker Compose installed

## Quick Start (Docker + Bun)

### 1. Prepare Your VPS
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install nginx (for reverse proxy)
sudo apt install nginx -y
```

### 2. Clone and Deploy
```bash
# Clone your repository
git clone <your-repo-url> /opt/opencode-cli
cd /opt/opencode-cli

# Build and start with Docker Compose (uses Bun for faster builds)
docker-compose up -d --build

# Check logs
docker-compose logs -f opencode-cli
```

### 3. Verify Deployment
```bash
# Check container status
docker-compose ps

# Test the application
curl http://localhost

# View resource usage
docker stats opencode-cli
```

## Plugin Management

### Adding Plugins
Plugins can be added through the UI or by placing them in the `plugins` directory:

```bash
# Place plugin files in the plugins directory
cp my-plugin.js /opt/opencode-cli/plugins/

# Restart the container to load new plugins
docker-compose restart opencode-cli
```

## Development Workflow

### Local Development with Bun
```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run linting
bun run lint

# Fix linting issues
bun run lint:fix

# Format code
bun run format
```

### Building for Production
```bash
# Build the application
bun run build

# Preview the build
bun run preview
```

## Alternative Deployment Options

### Option 1: Render (Bun Native)
Render supports Bun natively, so you can deploy without Docker:

1. Fork your repository
2. Create a new **Web Service** on Render
3. Set **Language** to `Bun` (if available) or `Docker`
4. Render will auto-detect and deploy

### Option 2: Direct VPS with Bun
If you prefer running Bun directly without Docker:

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Clone and build
cd /opt/opencode-cli
bun install
bun run build

# Serve the build
bun run preview
```

## Maintenance

### Update the Application
```bash
# Docker method (recommended)
cd /opt/opencode-cli
git pull
docker-compose down
docker-compose up -d --build

# The build will use Bun internally for dependency management
```

## Troubleshooting

### Build Issues
```bash
# Clear Docker cache and rebuild
docker-compose down
docker system prune -a
docker-compose up -d --build
```

## Resources

- [Bun Docker Guide](https://bun.com/docs/guides/ecosystem/docker)
- [Biome Documentation](https://biomejs.dev/)