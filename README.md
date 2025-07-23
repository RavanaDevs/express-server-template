# Express Server Template

A production-ready, enterprise-grade Express.js server template built with TypeScript, featuring comprehensive testing, Docker containerization, load balancing, graceful shutdown mechanisms, and database integration.

## 🚀 Features

### Core Technologies
- **Express.js 5.1.0** with TypeScript for type safety and modern JavaScript features
- **Prisma ORM** with PostgreSQL for robust database operations
- **Jest & Supertest** comprehensive testing suite with 96%+ coverage
- **Docker & Docker Compose** with multi-stage builds and production optimization
- **Nginx Load Balancer** with reverse proxy and health checks

### Production Features
- ✅ **Graceful Shutdown** - Docker-compatible SIGTERM/SIGINT handling with 30s timeout
- ✅ **Health Checks** - Kubernetes/Docker-ready liveness and readiness probes
- ✅ **Error Handling** - Centralized error middleware with proper logging
- ✅ **CORS Support** - Cross-origin resource sharing configuration
- ✅ **Load Balancing** - Nginx reverse proxy with configurable replicas
- ✅ **Security** - Non-root Docker user, security headers, rate limiting
- ✅ **Monitoring** - Process tracking, connection management, health endpoints

## 📁 Project Architecture

```
express-server-template/
├── src/                           # Source code
│   ├── app.ts                     # Express app configuration
│   ├── index.ts                   # Server entry point with graceful shutdown
│   ├── controllers/               # Request handlers
│   │   └── health.controller.ts   # Health check endpoints
│   ├── middlewares/               # Custom middleware
│   │   └── error-handler.ts       # Global error handling
│   └── routes/                    # Route definitions
│       └── health.route.ts        # Health check routes
├── tests/                         # Comprehensive test suite
│   ├── setup.ts                   # Global test configuration
│   ├── controllers/               # Controller unit tests
│   ├── middlewares/               # Middleware unit tests
│   ├── routes/                    # Route unit tests
│   ├── integration/               # Integration tests
│   ├── docker/                    # Docker-specific tests
│   └── utils/                     # Utility tests
├── prisma/                        # Database schema and migrations
│   ├── schema.prisma              # Database schema definition
│   └── migrations/                # Database migration files
├── nginx/                         # Load balancer configuration
│   └── nginx.conf                 # Nginx reverse proxy config
├── docs/                          # Documentation
│   ├── DOCKER.md                  # Docker deployment guide
│   ├── TESTING.md                 # Testing documentation
│   ├── GRACEFUL_SHUTDOWN.md       # Shutdown implementation details
│   └── load-balancer.md           # Load balancing setup
├── Dockerfile                     # Multi-stage container build
├── docker-compose.yml             # Service orchestration
├── jest.config.js                 # Test configuration
├── test-runner.js                 # Custom test runner utility
└── package.json                   # Dependencies and scripts
```

## 🛠️ Technology Stack

### Backend Framework
- **Express.js 5.1.0** - Fast, unopinionated web framework
- **TypeScript 5.8.3** - Static type checking and modern ES features
- **Node.js 22** - Latest LTS runtime environment

### Database & ORM
- **Prisma 6.11.1** - Next-generation ORM with type safety
- **PostgreSQL** - Robust relational database
- **Database Migrations** - Version-controlled schema changes

### Testing Framework
- **Jest 30.0.5** - JavaScript testing framework
- **Supertest 7.1.3** - HTTP assertion library
- **ts-jest 29.4.0** - TypeScript preprocessor for Jest
- **96%+ Test Coverage** - Comprehensive test suite

### DevOps & Containerization
- **Docker** - Containerization with multi-stage builds
- **Docker Compose** - Multi-service orchestration
- **Nginx Alpine** - Lightweight reverse proxy and load balancer
- **dumb-init** - Proper signal handling in containers

### Development Tools
- **pnpm** - Fast, disk space efficient package manager
- **nodemon** - Development server with hot reload
- **ESLint & Prettier** - Code formatting and linting

## 🚦 Quick Start

### Prerequisites
- Node.js 22+ and pnpm
- Docker and Docker Compose
- PostgreSQL (for local development)

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd express-server-template

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
pnpm prisma migrate dev

# Start development server
pnpm dev
```

### Docker Development

```bash
# Start all services (app + nginx load balancer)
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔗 API Endpoints

### Health Check Endpoints

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/health/liveness` | GET | Liveness probe for containers | `{"status":"ok","instance":"<hostname>","timestamp":"<ISO>"}` |
| `/health/readyness` | GET | Readiness probe for containers | `{"status":"ok","instance":"<hostname>","timestamp":"<ISO>"}` |

### Test Endpoints

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/` | GET | Test error handling | `{"error":"Something went wrong on the server"}` |

## 🧪 Testing

### Test Categories

- **Unit Tests**: Controllers, middlewares, routes with mocked dependencies
- **Integration Tests**: Full application testing with HTTP requests
- **Docker Tests**: Graceful shutdown and signal handling
- **Database Tests**: Prisma client configuration and setup

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode (development)
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Run specific test file
pnpm test health.controller.test.ts

# Use custom test runner
node test-runner.js coverage
node test-runner.js controllers
```

### Test Coverage

Current coverage metrics:
- **Overall**: 96.55% statement coverage
- **Controllers**: 100% coverage
- **Middlewares**: 100% coverage
- **Routes**: 100% coverage
- **Integration**: Full API coverage

## 🐳 Docker Deployment

### Architecture Options

#### Single Instance (Development)
```bash
# Run single app container
docker run -p 3000:3000 express-server-template
```

#### Load Balanced (Production)
```bash
# Run with nginx load balancer and multiple replicas
docker-compose up --build
# Access via: http://localhost:5000
```

### Docker Configuration

#### Multi-Stage Build Process
1. **Builder Stage**: Install dependencies, build TypeScript
2. **Production Stage**: Minimal runtime with non-root user

#### Security Features
- Non-root user (nodejs:nodejs)
- Minimal Alpine Linux base image
- Only production dependencies in final image
- Health checks for container orchestration

#### Graceful Shutdown
- **SIGTERM** handling with 30-second timeout
- Connection tracking and cleanup
- Database connection management
- Docker-compatible signal forwarding with `dumb-init`

## ⚖️ Load Balancing

### Nginx Configuration
- **Upstream**: Configurable app replicas
- **Algorithm**: Round-robin (configurable)
- **Health Checks**: Automatic failover for unhealthy instances
- **Rate Limiting**: DDoS protection
- **Security Headers**: XSS, CSRF protection

### Scaling Options

```bash
# Scale to 3 replicas (current docker-compose configuration)
docker-compose up --build

# Manual scaling via Docker Compose
docker-compose up --scale app=5
```

## 🗄️ Database

### Prisma Schema
```prisma
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
  posts Post[]
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  content  String
  author   User   @relation(fields: [authorId], references: [id])
  authorId Int
}
```

### Database Operations
```bash
# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Reset database
pnpm prisma migrate reset

# Open Prisma Studio
pnpm prisma studio
```

## 🔧 Configuration

### Environment Variables
```env
# Application Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# Load Balancer Configuration (optional)
INSTANCE_ID=app1
```

### Docker Compose Variables
- **Replicas**: Configure number of app instances (currently set to 3)
- **Health Check**: Timing and retry configuration
- **Grace Period**: Shutdown timeout settings
- **Environment**: Pass-through environment variables

## 📊 Monitoring & Health Checks

### Application Health
- **Liveness**: `/health/liveness` - Basic application health
- **Readiness**: `/health/readyness` - Application ready to receive traffic
- **Instance Identification**: Each replica reports its hostname/ID

### Docker Health Checks
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/health/liveness || exit 1
```

### Nginx Health Monitoring
- Upstream health checks
- Automatic failover
- Connection pooling
- Request distribution metrics

## 🔒 Security Features

### Container Security
- Non-root user execution
- Minimal Alpine Linux base
- Security-focused multi-stage builds
- Network isolation with Docker networks

### Application Security
- CORS configuration
- Error handling without information disclosure
- Rate limiting via Nginx
- Security headers (XSS, CSRF protection)

### Production Recommendations
- Use secrets management for sensitive data
- Configure HTTPS with SSL certificates
- Implement proper logging and monitoring
- Regular security updates and vulnerability scanning

## 📝 Scripts Reference

```json
{
  "dev": "nodemon --exec ts-node src/index.ts",
  "build": "tsc --build tsconfig.json",
  "start": "node dist/index.js",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "docker:build": "docker build -t express-server-template .",
  "docker:run": "docker run -d --name express-app --stop-timeout 30 -p 3000:3000 express-server-template",
  "docker:stop": "docker stop express-app && docker rm express-app",
  "docker:compose:up": "docker-compose up -d",
  "docker:compose:down": "docker-compose down"
}
```

## 🚀 Deployment Strategies

### Development
1. Local development with `pnpm dev`
2. Docker development with `docker-compose up`
3. Testing with `pnpm test:watch`

### Staging
1. Build with `docker build`
2. Run integration tests
3. Deploy with Docker Compose

### Production
1. Multi-replica deployment with load balancer
2. Database migrations with `prisma migrate deploy`
3. Health check monitoring
4. Graceful shutdown compliance

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new functionality
4. Ensure all tests pass (`pnpm test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards
- TypeScript with strict type checking
- Jest tests for all new functionality
- Docker compatibility for all features
- Documentation for public APIs

## 📚 Documentation

- [Docker Deployment Guide](./docs/DOCKER.md) - Comprehensive Docker setup
- [Testing Guide](./docs/TESTING.md) - Testing framework and best practices
- [Graceful Shutdown](./docs/GRACEFUL_SHUTDOWN.md) - Signal handling implementation
- [Load Balancer Setup](./docs/load-balancer.md) - Nginx configuration details

## 🐛 Troubleshooting

### Common Issues

**Docker containers not starting**
```bash
# Check logs
docker-compose logs

# Check health status
docker-compose ps
```

**Load balancer 502 errors**
```bash
# Verify app containers are healthy
docker-compose ps
curl http://localhost:3000/health/liveness

# Check nginx configuration
docker-compose exec nginx nginx -t
```

**Database connection issues**
```bash
# Verify DATABASE_URL in .env
# Check database server status
# Run migrations: pnpm prisma migrate dev
```

### Performance Optimization
- Configure nginx worker processes
- Tune Docker resource limits
- Optimize database connection pooling
- Monitor application metrics

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 💬 Support

For support and questions:
- Open an issue in the GitHub repository
- Check existing documentation in the `docs/` directory
- Review the comprehensive test suite for usage examples

---

**Built with ❤️ for production-ready Express.js applications**
