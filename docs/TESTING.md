# Testing Guide

This project includes a comprehensive test suite using Jest and Supertest for testing the Express.js server.

## Test Structure

The test files are organized in the `tests/` directory with the following structure:

```
tests/
├── setup.ts                      # Global test configuration
├── controllers/                  # Controller unit tests
│   └── health.controller.test.ts
├── middlewares/                  # Middleware unit tests
│   └── error-handler.test.ts
├── routes/                       # Route unit tests
│   └── health.route.test.ts
├── integration/                  # Integration tests
│   └── error-handling.test.ts
├── server/                       # Server configuration tests
│   └── startup.test.ts
├── database/                     # Database-related tests
│   └── prisma.test.ts
└── utils/                        # Utility tests
    └── general.test.ts
```

## Test Categories

### Unit Tests

- **Controllers**: Test individual controller functions with mocked dependencies
- **Middlewares**: Test middleware functions like error handlers
- **Routes**: Test route definitions and their integration with controllers

### Integration Tests

- **App Tests**: Test the full Express application with real HTTP requests
- **Error Handling**: Test error scenarios and edge cases
- **Database Tests**: Test Prisma client setup and configuration (currently basic setup tests)

### Configuration Tests

- **Server Startup**: Test environment variable handling and server configuration
- **General Utilities**: Test basic JavaScript/TypeScript functionality and environment setup

## Running Tests

### All Tests

```bash
pnpm test
```

### Watch Mode (for development)

```bash
pnpm test:watch
```

### Coverage Report

```bash
pnpm test:coverage
```

### Run Specific Test File

```bash
pnpm test tests/controllers/health.controller.test.ts
```

## Test Configuration

The testing setup includes:

- **Jest**: Testing framework with TypeScript support
- **Supertest**: HTTP assertion library for testing Express apps
- **Test Environment**: Isolated test environment with mocked environment variables
- **Coverage**: Code coverage reporting for all source files (excluding generated files)

### Environment Variables for Tests

- `NODE_ENV=test`
- `DATABASE_URL=postgresql://test:test@localhost:5432/test_db`
- `PORT=3001`

## Coverage Results

Current test coverage:

- **Overall**: 96.55% statement coverage
- **Controllers**: 100% coverage
- **Middlewares**: 100% coverage
- **Routes**: 100% coverage
- **App**: 92.3% coverage (line 17 in app.ts not covered - unreachable code after throw)

## Adding New Tests

### For Controllers

```typescript
import { Request, Response, NextFunction } from 'express'
import { yourController } from '../../src/controllers/your-controller'

describe('Your Controller', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    mockRequest = {}
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }
    mockNext = jest.fn()
  })

  // Your tests here
})
```

### For Routes

```typescript
import request from 'supertest'
import express from 'express'
import yourRouter from '../../src/routes/your-route'

describe('Your Routes', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
    app.use('/api', yourRouter)
  })

  it('should handle GET request', async () => {
    const response = await request(app).get('/api/endpoint').expect(200)

    expect(response.body).toEqual(expectedResponse)
  })
})
```

### For Integration Tests

```typescript
import request from 'supertest'
import { app } from '../src/app'

describe('Integration Tests', () => {
  it('should test complete flow', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send(testData)
      .expect(201)

    expect(response.body).toMatchObject(expectedResponse)
  })
})
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Mocking**: Mock external dependencies (databases, APIs, etc.)
3. **Cleanup**: Use `beforeEach`/`afterEach` to reset state between tests
4. **Descriptive Names**: Use clear, descriptive test names that explain what is being tested
5. **Coverage**: Aim for high test coverage but focus on testing critical business logic
6. **Edge Cases**: Test both happy paths and error scenarios

## Continuous Integration

The test suite is designed to run in CI/CD environments. Make sure to:

- Set appropriate environment variables for your CI system
- Use a test database separate from production
- Run tests before deploying to any environment
