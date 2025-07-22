# Graceful Shutdown Features

## Overview

This Express server template includes comprehensive Docker-compatible graceful shutdown functionality that properly handles container orchestration signals.

## Features

### 🐳 Docker Signal Handling

- **SIGTERM**: Primary shutdown signal from Docker/Kubernetes
- **SIGINT**: Development interrupt signal (Ctrl+C)
- **SIGKILL**: Cannot be caught, but prepared for with timeouts

### 🔄 Shutdown Process

1. **Stop accepting new connections** - HTTP server stops listening
2. **Close existing connections** - Active connections are gracefully terminated
3. **Database cleanup** - Prisma client disconnects properly
4. **Resource cleanup** - All resources are properly released
5. **Graceful exit** - Process exits with appropriate code

### ⏱️ Timeout Protection

- **30-second internal timeout** - Prevents hanging during shutdown
- **Force exit protection** - Ensures process doesn't hang indefinitely
- **Docker compatibility** - Works with container orchestration timeouts

## Usage

### Development

```bash
# Start the server
npm run dev

# Graceful shutdown with Ctrl+C (SIGINT)
# Logs will show: "SIGINT signal received. Starting graceful shutdown..."
```

### Docker

```bash
# Build and run
docker build -t express-app .
docker run -d --name my-app --stop-timeout 30 -p 3000:3000 express-app

# Graceful shutdown
docker stop my-app
# Logs will show: "SIGTERM signal received. Starting graceful shutdown..."
```

### Docker Compose

```bash
# Start with database
docker-compose up -d

# Graceful shutdown (30s grace period configured)
docker-compose down
```

## Configuration

### Environment Variables

- `NODE_ENV`: Application environment
- `PORT`: Server port (default: 3000)
- `DATABASE_URL`: PostgreSQL connection string

### Docker Configuration

```yaml
# docker-compose.yml
services:
  app:
    stop_grace_period: 30s # Time before SIGKILL
    restart: unless-stopped
```

## Monitoring

### Log Messages

The application provides clear shutdown progress logs:

```
🔄 SIGTERM signal received. Starting graceful shutdown...
📡 Stopping HTTP server from accepting new connections...
🔌 Closing existing connections...
🗄️  Closing database connections...
✅ Database connections closed
🎉 Graceful shutdown completed successfully
```

### Health Checks

- `/health/liveness` - Container liveness probe
- `/health/readyness` - Container readiness probe

## Testing

### Automated Tests

```bash
# Run graceful shutdown tests
npm test tests/docker/graceful-shutdown.test.ts

# Test with real Docker container
chmod +x test-graceful-shutdown.sh
./test-graceful-shutdown.sh
```

### Manual Testing

```bash
# Start container
docker run -d --name test-app -p 3000:3000 express-app

# Test health endpoint
curl http://localhost:3000/health/liveness

# Send SIGTERM and watch logs
docker kill --signal=TERM test-app
docker logs -f test-app

# Clean up
docker rm test-app
```

## Best Practices

1. **Always use exec form in Dockerfile CMD**

   ```dockerfile
   CMD ["node", "dist/index.js"]  # ✅ Correct
   CMD node dist/index.js         # ❌ Wrong
   ```

2. **Set appropriate timeouts**

   - App timeout (30s) < Docker timeout (35s+)
   - Allows graceful shutdown before force kill

3. **Monitor shutdown logs**

   - Check for completion messages
   - Verify no error messages during shutdown

4. **Use health checks**
   - Enables zero-downtime deployments
   - Helps orchestrators manage container lifecycle

## Troubleshooting

### Common Issues

**Container doesn't shut down gracefully:**

- Check Dockerfile uses exec form CMD
- Verify dumb-init is installed and used
- Ensure proper signal handling setup

**Database connections not closing:**

- Check Prisma client setup
- Verify $disconnect() is called
- Check for connection pool settings

**Timeout errors:**

- Increase Docker stop timeout
- Check for hanging async operations
- Verify all resources are properly cleaned up

### Debug Commands

```bash
# Check process tree
docker exec <container> ps aux

# Test signal handling
docker exec <container> kill -TERM 1

# Monitor connections
docker exec <container> netstat -tulpn
```

For more detailed Docker deployment information, see [DOCKER.md](./DOCKER.md).
