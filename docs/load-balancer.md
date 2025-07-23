# Load Balancer Setup with Nginx

This document explains the load balancer configuration using Nginx as a reverse proxy with 2 app service replicas.

## Architecture Overview

```
Internet → Nginx (Port 80) → Load Balancer → App1 (Port 3000) + App2 (Port 3000)
```

## Components

### 1. Nginx Load Balancer

- **Image**: `nginx:alpine`
- **Ports**: 80 (HTTP), 443 (HTTPS ready)
- **Algorithm**: Least connections (`least_conn`)
- **Health Checks**: Monitors `/health` endpoint
- **Features**:
  - Rate limiting (10 req/s for API, 100 req/s for health)
  - Gzip compression
  - Security headers
  - Connection keepalive
  - Automatic failover

### 2. App Service Replicas

- **app1**: First instance with `INSTANCE_ID=app1`
- **app2**: Second instance with `INSTANCE_ID=app2`
- **Exposure**: Internal port 3000 (not externally accessible)
- **Load Balancing**: Requests distributed between instances

## Configuration Files

### docker-compose.yml

- Defines 3 services: `nginx`, `app1`, `app2`
- Nginx depends on both app services
- Apps expose port 3000 internally
- Only Nginx exposes external ports (80, 443)

### nginx/nginx.conf

- Main Nginx configuration
- Upstream definition with both app services
- Global settings (gzip, logging, rate limiting)

### nginx/conf.d/default.conf

- Virtual host configuration
- Proxy settings and headers
- Rate limiting rules
- Health check routing

## Usage

### Starting the Load Balanced Setup

```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d --build

# Scale services (alternative method)
docker-compose up --scale app=2
```

### Testing Load Balancing

```bash
# Test health endpoint multiple times to see different instances
curl http://localhost/health/liveness

# Expected responses will alternate between:
# {"status":"ok","instance":"app1","timestamp":"..."}
# {"status":"ok","instance":"app2","timestamp":"..."}
```

### Monitoring

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs nginx
docker-compose logs app1
docker-compose logs app2

# Follow logs in real-time
docker-compose logs -f

# Check Nginx status (from within nginx container)
curl http://localhost/nginx-status
```

## Load Balancer Features

### 1. Health Checks

- **Nginx Level**: Checks `/health` endpoint every 30s
- **Docker Level**: Each app service has health checks
- **Automatic Failover**: Unhealthy instances removed from rotation

### 2. Rate Limiting

- **API Endpoints**: 10 requests/second with burst of 20
- **Health Endpoints**: 100 requests/second with burst of 50
- **Protection**: Against DDoS and overloading

### 3. Load Balancing Algorithm

- **Method**: Least connections
- **Failover**: Max 3 failures, 30s timeout
- **Sticky Sessions**: Not enabled (stateless apps)

### 4. Security Headers

- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Configuration Customization

### Adding More Replicas

To add more app instances, modify `docker-compose.yml`:

```yaml
app3:
  build: .
  expose:
    - '3000'
  env_file:
    - .env
  environment:
    - INSTANCE_ID=app3
  # ... same config as app1/app2
```

And update `nginx/nginx.conf` upstream:

```nginx
upstream app_backend {
    least_conn;
    server app1:3000 max_fails=3 fail_timeout=30s;
    server app2:3000 max_fails=3 fail_timeout=30s;
    server app3:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

### Changing Load Balancing Algorithm

In `nginx/nginx.conf`, replace `least_conn;` with:

- `ip_hash;` - Sticky sessions based on client IP
- `hash $request_uri;` - Route based on URL
- Remove directive for round-robin (default)

### Adjusting Rate Limits

In `nginx/nginx.conf`, modify:

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;  # Reduce to 5 req/s
limit_req_zone $binary_remote_addr zone=health:10m rate=50r/s;  # Reduce health checks
```

## SSL/HTTPS Configuration

To enable HTTPS, add to `nginx/conf.d/default.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name localhost;

    ssl_certificate /etc/ssl/certs/server.crt;
    ssl_certificate_key /etc/ssl/private/server.key;

    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name localhost;
    return 301 https://$server_name$request_uri;
}
```

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**

   - Check if app services are healthy: `docker-compose ps`
   - Verify app services are exposing port 3000
   - Check logs: `docker-compose logs app1 app2`

2. **Rate Limiting Errors (429)**

   - Increase rate limits in nginx.conf
   - Check burst settings in default.conf

3. **Uneven Load Distribution**
   - Verify least_conn is configured
   - Check if one instance is failing health checks
   - Monitor with: `docker-compose logs nginx`

### Performance Tuning

1. **Increase Worker Processes**

   ```nginx
   worker_processes auto;  # Use all CPU cores
   ```

2. **Tune Keepalive Connections**

   ```nginx
   upstream app_backend {
       keepalive 64;  # Increase from 32
   }
   ```

3. **Optimize Buffer Sizes**
   ```nginx
   proxy_buffer_size 256k;  # Increase for large responses
   proxy_buffers 8 256k;
   ```

## Production Considerations

1. **SSL Certificates**: Use Let's Encrypt or proper SSL certificates
2. **Monitoring**: Add Prometheus/Grafana for metrics
3. **Logging**: Configure log rotation and centralized logging
4. **Backup**: Regular configuration backups
5. **Security**: Update Nginx regularly, configure firewall
6. **Scaling**: Consider horizontal pod autoscaling in Kubernetes
