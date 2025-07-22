import request from 'supertest'
import express from 'express'
import healthRouter from '../../src/routes/health.route'

describe('Health Routes', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
    app.use('/health', healthRouter)
  })

  describe('GET /health/liveness', () => {
    it('should return 200 status with ok message', async () => {
      const response = await request(app).get('/health/liveness').expect(200)

      expect(response.body).toEqual({ status: 'ok' })
    })
  })

  describe('GET /health/readyness', () => {
    it('should return 200 status with ok message', async () => {
      const response = await request(app).get('/health/readyness').expect(200)

      expect(response.body).toEqual({ status: 'ok' })
    })
  })

  describe('Non-existent routes', () => {
    it('should return 404 for non-existent health endpoints', async () => {
      await request(app).get('/health/nonexistent').expect(404)
    })
  })
})
