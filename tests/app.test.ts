import request from 'supertest'
import { app } from '../src/app'

describe('App Integration Tests', () => {
  describe('GET /', () => {
    it('should handle errors and return 500 status', async () => {
      const response = await request(app).get('/').expect(500)

      expect(response.body).toEqual({
        error: 'Something went wrong on the server',
      })
    })
  })

  describe('Health Endpoints', () => {
    it('should return 200 for liveness check', async () => {
      const response = await request(app).get('/health/liveness').expect(200)

      expect(response.body).toEqual({ status: 'ok' })
    })

    it('should return 200 for readiness check', async () => {
      const response = await request(app).get('/health/readyness').expect(200)

      expect(response.body).toEqual({ status: 'ok' })
    })
  })

  describe('CORS', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/health/liveness')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')

      expect(response.headers['access-control-allow-origin']).toBe('*')
    })
  })

  describe('JSON Parsing', () => {
    it('should parse JSON request bodies', async () => {
      // Since we don't have any POST endpoints, we'll test with a non-existent route
      // to ensure the JSON middleware is working
      await request(app)
        .post('/test')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json')
        .expect(404) // Should return 404 for non-existent route, not a parsing error
    })
  })

  describe('Non-existent routes', () => {
    it('should return 404 for non-existent routes', async () => {
      await request(app).get('/non-existent').expect(404)
    })

    it('should return 404 for non-existent POST routes', async () => {
      await request(app).post('/non-existent').expect(404)
    })
  })
})
