# Build stage using Bun
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* biome.json ./

# Install dependencies using Bun (much faster than npm/pnpm)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Run Biome checks
RUN bun run lint

# Build the application using Bun
RUN bun run build

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create directory for plugins
RUN mkdir -p /usr/share/nginx/html/plugins

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]