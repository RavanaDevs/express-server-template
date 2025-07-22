# Multi-stage build for production optimization

# Build stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY src/ ./src/
COPY prisma/ ./prisma/

# Generate Prisma client
RUN pnpm prisma generate

# Build TypeScript
RUN pnpm build

# Production stage
FROM node:22-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Copy production dependencies
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Create logs directory
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/health/liveness || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application with proper signal handling
# Using exec form ensures signals are passed correctly to the Node.js process
CMD ["node", "dist/index.js"]

# Docker configuration for graceful shutdown:
# - SIGTERM grace period: 30 seconds (configurable via docker stop -t)
# - SIGKILL sent after grace period expires
# - dumb-init ensures proper signal forwarding to Node.js process