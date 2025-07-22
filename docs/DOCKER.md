# Docker Deployment Guide

This guide explains how to deploy the Express server with proper graceful shutdown handling in Docker environments.

## Graceful Shutdown Implementation

Our Docker implementation handles the following signals:

- **SIGTERM**: Primary signal sent by Docker for graceful shutdown
- **SIGINT**: Interrupt signal (Ctrl+C) for development
- **SIGKILL**: Cannot be caught, but we prepare for it with timeouts

### Signal Flow in Docker

1. `docker stop` sends **SIGTERM** to the main process
2. Docker waits for the grace period (default: 10s, configurable)
3. If process hasn't exited, Docker sends **SIGKILL** (force kill)

## Building and Running

### Development

```bash
# Start with Docker Compose (includes database)
docker-compose up --build

# Stop gracefully (sends SIGTERM)
docker-compose down

# Force stop (shorter timeout)
docker-compose down -t 5
```

### Production Build

```bash
# Build the image
docker build -t express-server-template .

# Run with custom grace period
docker run -d \
  --name express-app \
  --stop-timeout 30 \
  -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  express-server-template

# Stop gracefully
docker stop express-app

# Stop with custom timeout
docker stop -t 60 express-app
```

## Configuration Options

### Environment Variables

```bash
# Server configuration
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db

# Shutdown configuration (built into app)
SHUTDOWN_TIMEOUT=30000  # 30 seconds in milliseconds
```

### Docker Compose Configuration

```yaml
services:
  app:
    # Graceful shutdown timeout (time before SIGKILL)
    stop_grace_period: 30s

    # Health check for zero-downtime deployments
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health/liveness']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
```

## Kubernetes Deployment

For Kubernetes, use these configurations:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: express-server
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: express-server
          image: express-server-template:latest
          ports:
            - containerPort: 3000
          # Graceful shutdown configuration
          lifecycle:
            preStop:
              exec:
                command: ['/bin/sh', '-c', 'sleep 10']
          # Health checks
          livenessProbe:
            httpGet:
              path: /health/liveness
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/readyness
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
      # Grace period for pod termination
      terminationGracePeriodSeconds: 30
```

## Monitoring Graceful Shutdown

### Log Messages

The application logs these stages during shutdown:

```
🔄 SIGTERM signal received. Starting graceful shutdown...
📡 Stopping HTTP server from accepting new connections...
🔌 Closing existing connections...
🗄️  Closing database connections...
✅ Database connections closed
🎉 Graceful shutdown completed successfully
```

### Monitoring Commands

```bash
# Watch container logs during shutdown
docker logs -f <container-id>

# Monitor container events
docker events --filter container=<container-name>

# Check container exit codes
docker ps -a
```

## Best Practices

### 1. Always Use Exec Form in CMD

```dockerfile
# ✅ Good - signals reach Node.js process
CMD ["node", "dist/index.js"]

# ❌ Bad - signals get lost in shell
CMD node dist/index.js
```

### 2. Use Init System (dumb-init)

```dockerfile
# Install and use dumb-init for proper signal handling
RUN apk add --no-cache dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

### 3. Set Appropriate Timeouts

```bash
# Docker stop timeout should be longer than app timeout
docker stop -t 45 <container>  # App has 30s internal timeout
```

### 4. Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/health/liveness || exit 1
```

## Troubleshooting

### Common Issues

1. **Application doesn't shut down gracefully**

   - Check if using exec form in CMD
   - Verify dumb-init is installed and used
   - Ensure signal handlers are properly set up

2. **Database connections not closing**

   - Check Prisma client disconnection in shutdown handler
   - Verify database connection pooling settings

3. **Docker kills container too quickly**
   - Increase `stop_grace_period` in docker-compose.yml
   - Use `--stop-timeout` flag with docker run

### Debug Commands

```bash
# Check process tree in container
docker exec <container> ps aux

# Test signal handling
docker exec <container> kill -TERM 1

# Monitor resource cleanup
docker exec <container> netstat -tulpn
docker exec <container> lsof -p 1
```

## Testing Graceful Shutdown

```bash
# Start the application
docker-compose up -d

# Send SIGTERM manually
docker kill --signal=TERM <container-id>

# Or use docker stop (which sends SIGTERM)
docker stop <container-id>

# Check logs for graceful shutdown messages
docker logs <container-id>
```

## Security Considerations

- Run as non-root user (implemented in Dockerfile)
- Use minimal Alpine base image
- Only expose necessary ports
- Set resource limits in production

```yaml
# Docker Compose resource limits
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```
