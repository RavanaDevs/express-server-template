import { Request, Response, NextFunction } from 'express'
import { liveness, readyness } from '../../src/controllers/health.controller'

describe('Health Controller', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    mockRequest = {}
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    }
    mockNext = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('liveness', () => {
    it('should return status 200 with ok message', () => {
      liveness(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.send).toHaveBeenCalledWith({ status: 'ok' })
    })

    it('should not call next function', () => {
      liveness(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('readyness', () => {
    it('should return status 200 with ok message', () => {
      readyness(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.send).toHaveBeenCalledWith({ status: 'ok' })
    })

    it('should not call next function', () => {
      readyness(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).not.toHaveBeenCalled()
    })
  })
})
