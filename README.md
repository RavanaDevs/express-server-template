# Express Server Template

A production-ready Express.js server template with TypeScript, Docker support, comprehensive testing, graceful shutdown, and load balancing capabilities.

## Features

- 🚀 **Express.js** with TypeScript for type safety
- 🧪 **Comprehensive Testing** with Jest and Supertest (96%+ coverage)
- 🐳 **Docker Ready** with multi-stage builds and graceful shutdown
- 🔄 **Load Balancer** with Nginx reverse proxy
- 🏥 **Health Checks** with liveness and readiness endpoints
- 📊 **Error Handling** with structured middleware
- 🛡️ **Security** headers and rate limiting
- 🔧 **Prisma ORM** for database operations

## Quick Start

### Single Instance (Development)

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

### Load Balanced Setup (Production)

```bash
# Start 2 app replicas with Nginx load balancer
docker-compose up --build

# Test load balancing
.\scripts\test-load-balancer.bat  # Windows
./scripts/test-load-balancer.sh   # Linux/Mac
```

## Architecture

### Development

```
Client → Express App (Port 3000)
```

### Production (Load Balanced)

```
Internet → Nginx (Port 80) → Load Balancer → App1 + App2 (Port 3000)
```

## API Endpoints

| Endpoint            | Method | Description                           |
| ------------------- | ------ | ------------------------------------- |
| `/health/liveness`  | GET    | Liveness probe for Kubernetes/Docker  |
| `/health/readiness` | GET    | Readiness probe for Kubernetes/Docker |

### Health Check Response

```json
{
  "status": "ok",
  "instance": "app1",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Project Structure

```
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── index.ts               # Server entry point with graceful shutdown
│   ├── controllers/           # Request handlers
│   ├── middlewares/           # Custom middleware
│   └── routes/                # Route definitions
├── tests/                     # Test suites
├── nginx/                     # Nginx configuration for load balancing
├── scripts/                   # Utility scripts
├── docs/                      # Documentation
├── prisma/                    # Database schema and migrations
├── docker-compose.yml         # Multi-service orchestration
└── Dockerfile                 # Container definition
```

## Docker Configuration

### Single Service

```yaml
services:
  app:
    build: .
    ports:
      - '3000:3000'
    env_file:
      - .env
```

### Load Balanced (Current)

```yaml
services:
  nginx: # Load balancer
    image: nginx:alpine
    ports:
      - '80:80'

  app1: # First instance
    build: .
    expose:
      - '3000'

  app2: # Second instance
    build: .
    expose:
      - '3000'
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=production
PORT=3000
INSTANCE_ID=app1

# Database (if using Prisma)
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# Add your custom environment variables here
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test health.controller.test.ts
```

### Test Coverage

- **Controllers**: Health endpoint tests
- **Middleware**: Error handling tests
- **Routes**: HTTP route tests
- **Integration**: End-to-end API tests
- **Docker**: Container and graceful shutdown tests

## Load Balancing

### Features

- **Algorithm**: Least connections
- **Health Checks**: Automatic failover for unhealthy instances
- **Rate Limiting**: 10 req/s for API, 100 req/s for health checks
- **Security**: Headers, gzip compression, connection keepalive

### Testing Load Distribution

```bash
# Windows
.\scripts\test-load-balancer.bat

# Linux/Mac
chmod +x ./scripts/test-load-balancer.sh
./scripts/test-load-balancer.sh
```

### Scaling

To add more app instances:

1. Add new service in `docker-compose.yml`
2. Update Nginx upstream configuration
3. Restart services

```bash
# Scale to 3 instances (alternative method)
docker-compose up --scale app=3
```

## Graceful Shutdown

The application implements proper graceful shutdown for Docker containers:

- **SIGTERM**: Graceful shutdown with 30-second timeout
- **SIGINT**: Immediate shutdown for development (Ctrl+C)
- **Connection Tracking**: Closes existing connections properly
- **Database**: Closes Prisma connections

## Development

### Scripts

```bash
pnpm dev          # Start development server with hot reload
pnpm build        # Build TypeScript to JavaScript
pnpm start        # Start production server
pnpm test         # Run test suite
pnpm test:watch   # Run tests in watch mode
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
```

### Adding New Features

1. **Controllers**: Add business logic in `src/controllers/`
2. **Routes**: Define endpoints in `src/routes/`
3. **Middleware**: Add custom middleware in `src/middlewares/`
4. **Tests**: Write tests in `tests/` directory

## Deployment

### Docker Deployment

```bash
# Build and run single instance
docker build -t my-app .
docker run -p 3000:3000 my-app

# Build and run with load balancer
docker-compose up --build -d
```

### Health Checks

The application includes Docker health checks:

- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3 attempts
- **Start Period**: 30 seconds

## Monitoring

### Nginx Status

```bash
# Access Nginx status (from within container network)
curl http://localhost/nginx-status
```

### Application Logs

```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs nginx
docker-compose logs app1
docker-compose logs app2

# Follow logs in real-time
docker-compose logs -f
```

## Security

### Implemented Security Measures

- Rate limiting (DDoS protection)
- Security headers (XSS, CSRF protection)
- No server tokens exposure
- Network isolation (Docker)
- Environment variable management

### Security Headers

```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## Documentation

- [Load Balancer Setup](./docs/load-balancer.md) - Detailed load balancing configuration
- [Docker Environment Variables](./docs/docker-environment.md) - Environment variable best practices
- [Testing Guide](./docs/testing.md) - Comprehensive testing documentation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
