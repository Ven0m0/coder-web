# Self-Hosting Guide for OpenCode CLI

## Prerequisites
- A VPS (DigitalOcean, Hetzner, Linode, etc.)
- A domain name (optional but recommended)
- SSH access to your VPS

## Option 1: Docker Deployment (Recommended)

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

### 2. Deploy Your App
```bash
# Clone or upload your code to the VPS
git clone <your-repo-url> /opt/opencode-cli
cd /opt/opencode-cli

# Build and start with Docker Compose
docker-compose up -d --build
```

### 3. Configure Domain (Optional)
```bash
# Create nginx configuration for reverse proxy
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

## Option 2: Direct Nginx Deployment

### 1. Build the App Locally
```bash
npm run build
```

### 2. Upload to VPS
```bash
# Upload dist folder to VPS
scp -r dist/* user@your-vps-ip:/var/www/opencode-cli/
```

### 3. Configure Nginx
```bash
# Create nginx configuration
sudo nano /etc/nginx/sites-available/opencode-cli
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    root /var/www/opencode-cli;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable and restart
sudo ln -s /etc/nginx/sites-available/opencode-cli /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Set permissions
sudo chown -R www-data:www-data /var/www/opencode-cli
```

## Option 3: Static Hosting Services

You can also deploy to various static hosting platforms:

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### GitHub Pages
1. Go to repository Settings → Pages
2. Set source to `gh-pages` branch
3. Add deploy script to package.json:
```json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

## Maintenance

### Update the App
```bash
# Docker method
cd /opt/opencode-cli
git pull
docker-compose down
docker-compose up -d --build

# Direct method
cd /var/www/opencode-cli
git pull
npm run build
sudo systemctl restart nginx
```

### Monitor Logs
```bash
# Docker logs
docker-compose logs -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Security Recommendations

1. **Keep system updated**: `sudo apt update && sudo apt upgrade -y`
2. **Use SSH keys**: Disable password authentication
3. **Configure firewall**: `sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw enable`
4. **Regular backups**: Set up automated backups of your data
5. **Monitor resources**: Use tools like htop or docker stats

## Resources

- [Self-Hosting Guide](https://github.com/mikeroyal/Self-Hosting-Guide)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)