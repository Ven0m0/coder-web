#!/bin/bash

# Build the application
echo "Building the application..."
npm run build

# The built files will be in the 'dist' folder
echo "Build complete! Files are in the 'dist' folder."
echo ""
echo "To deploy:"
echo "1. Upload the contents of 'dist/' to your web server"
echo "2. Configure your web server to serve index.html for all routes (SPA routing)"
echo ""
echo "Example nginx configuration:"
cat << 'EOF'
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/opencode-cli/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Optional: Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF