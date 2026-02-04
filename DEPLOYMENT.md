# Self-Hosting Guide for OpenCode CLI (Bun + Docker)

## Why Bun?

Bun is a modern JavaScript runtime that's significantly faster than Node.js for:
- **Package installation**: 20-100x faster than npm/pnpm
- **Build times**: Optimized for Vite and modern tooling
- **Runtime performance**: Lower memory footprint and faster execution

Based on [bun.com](https://bun.com/docs/guides/ecosystem/docker) and [docs.docker.com](https://docs.docker.com/guides/bun/containerize/) best practices.

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

## Domain Configuration (Optional)

### Setup Nginx Reverse Proxy
```bash
# Create nginx configuration
sudo nano /etc/nginx/sites-available/opencode-cli
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/opencode-cli /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate with Certbot
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Alternative Deployment Options

### Option 1: Render (Bun Native)
[Render supports Bun natively](https://render.com/docs/deploy-bun-docker), so you can deploy without Docker:

1. Fork your repository
2. Create a new **Web Service** on Render
3. Set **Language** to `Docker` (or `Bun` if available)
4. Render will auto-detect and deploy

### Option 2: Clever Cloud
[Clever Cloud supports Node.js & Bun runtimes](https://www.clever.cloud/developers/doc/applications/nodejs/):

1. Create a new application on Clever Cloud
2. Link your GitHub repository
3. Set runtime to `Bun`
4. Deploy automatically

### Option 3: Direct VPS with Bun
If you prefer running Bun directly without Docker:

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Clone and build
cd /opt/opencode-cli
bun install
bun run build

# Serve with a simple HTTP server
bunx serve dist -p 80
```

## Maintenance

### Update the Application
```bash
# Docker method (recommended)
cd /opt/opencode-cli
git pull
docker-compose down
docker-compose up -d --build

# The build will use Bun, making it much faster than npm/pnpm
```

### Monitor Performance
```bash
# View container logs
docker-compose logs -f opencode-cli

# Monitor resource usage
docker stats opencode-cli

# Check health status
docker inspect opencode-cli | grep -A 10 Health
```

### Backup Configuration
```bash
# Backup Docker volumes and configs
docker run --rm -v opencode_opencode-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/opencode-backup-$(date +%Y%m%d).tar.gz /data
```

## Performance Optimization

### Bun-Specific Optimizations
The Dockerfile already includes:
- **Multi-stage build**: Smaller final image
- **Bun for dependencies**: 20-100x faster installs
- **Health checks**: Automatic monitoring
- **Resource limits**: Prevents resource exhaustion

### Additional Optimizations
```yaml
# Add to docker-compose.yml for production
services:
  opencode-cli:
    # ... existing config ...
    environment:
      - NODE_ENV=production
      - BUN_RUNTIME_TRANSPORT=native  # Use native transport
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Security Best Practices

1. **Keep system updated**: `sudo apt update && sudo apt upgrade -y`
2. **Use SSH keys**: Disable password authentication
3. **Configure firewall**: 
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```
4. **Regular backups**: Set up automated backups
5. **Monitor resources**: Use `docker stats` and `docker-compose logs`
6. **Update images regularly**: `docker-compose pull && docker-compose up -d`

## Troubleshooting

### Build Issues
```bash
# Clear Docker cache and rebuild
docker-compose down
docker system prune -a
docker-compose up -d --build
```

### Container Won't Start
```bash
# Check logs
docker-compose logs opencode-cli

# Inspect container
docker inspect opencode-cli

# Check port conflicts
sudo netstat -tulpn | grep :80
```

### Performance Issues
```bash
# Increase Docker resources (in Docker Desktop settings)
# Or adjust limits in docker-compose.yml
```

## Cost Comparison

| Provider | Monthly Cost | Setup Time | Bun Support |
|----------|-------------|------------|-------------|
| DigitalOcean | $6 | 5 min | ✅ Docker |
| Hetzner | $4.50 | 5 min | ✅ Docker |
| Render | Free-$7 | 2 min | ✅ Native |
| Clever Cloud | Free-$15 | 2 min | ✅ Native |

## Resources

- [Bun Docker Guide](https://bun.com/docs/guides/ecosystem/docker)
- [Docker Bun Documentation](https://docs.docker.com/guides/bun/containerize/)
- [Render Bun Deployment](https://render.com/docs/deploy-bun-docker)
- [Clever Cloud Bun Support](https://www.clever.cloud/developers/doc/applications/nodejs/)
- [Self-Hosting Guide](https://github.com/mikeroyal/Self-Hosting-Guide)

## Quick Reference

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# View logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build

# Update
git pull && docker-compose up -d --build