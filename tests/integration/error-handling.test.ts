import request from 'supertest'
import express from 'express'
import { errorHandler } from '../../src/middlewares/error-handler'

describe('Error Handling Integration Tests', () => {
  let app: express.Application
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    app = express()
    app.use(express.json())

    // Mock console.error to avoid cluttering test output
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    jest.clearAllMocks()
  })

  describe('Error handling in routes', () => {
    it('should handle synchronous errors', async () => {
      app.get('/sync-error', (req, res, next) => {
        throw new Error('Synchronous error')
      })
      app.use(errorHandler)

      const response = await request(app).get('/sync-error').expect(500)

      expect(response.body).toEqual({
        error: 'Something went wrong on the server',
      })
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should handle asynchronous errors with next()', async () => {
      app.get('/async-error', async (req, res, next) => {
        try {
          await Promise.reject(new Error('Async error'))
        } catch (error) {
          next(error)
        }
      })
      app.use(errorHandler)

      const response = await request(app).get('/async-error').expect(500)

      expect(response.body).toEqual({
        error: 'Something went wrong on the server',
      })
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should handle JSON parsing errors', async () => {
      app.post('/json-test', (req, res) => {
        res.json({ received: req.body })
      })
      app.use(errorHandler)

      // Express 5.x handles JSON parsing errors differently than Express 4.x
      // It will return a 500 error through the error handler for malformed JSON
      const response = await request(app)
        .post('/json-test')
        .set('Content-Type', 'application/json')
        .send('invalid json {')
        .expect(500) // Express 5.x sends this to error handler

      expect(response.body).toEqual({
        error: 'Something went wrong on the server',
      })
    })
  })

  describe('Different error types', () => {
    it('should handle TypeError', async () => {
      app.get('/type-error', (req, res, next) => {
        const obj: any = null
        obj.someProperty.nestedProperty // This will throw TypeError
      })
      app.use(errorHandler)

      await request(app).get('/type-error').expect(500)

      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should handle ReferenceError', async () => {
      app.get('/reference-error', (req, res, next) => {
        // @ts-ignore - intentionally causing a reference error for testing
        undefinedVariable.someMethod()
      })
      app.use(errorHandler)

      await request(app).get('/reference-error').expect(500)

      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('Error handler edge cases', () => {
    it('should handle errors with no message', async () => {
      app.get('/empty-error', (req, res, next) => {
        const error = new Error()
        next(error)
      })
      app.use(errorHandler)

      await request(app).get('/empty-error').expect(500)

      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should handle non-Error objects', async () => {
      app.get('/string-error', (req, res, next) => {
        next('String error' as any)
      })
      app.use(errorHandler)

      await request(app).get('/string-error').expect(500)

      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })
})
