import { Request, Response, NextFunction } from 'express'
import { errorHandler } from '../../src/middlewares/error-handler'

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    mockRequest = {}
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    }
    mockNext = jest.fn()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
    consoleErrorSpy.mockRestore()
  })

  it('should log the error to console', () => {
    const testError = new Error('Test error message')

    errorHandler(
      testError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    )

    expect(consoleErrorSpy).toHaveBeenCalledWith(testError)
  })

  it('should return status 500 with error message', () => {
    const testError = new Error('Test error message')

    errorHandler(
      testError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    )

    expect(mockResponse.status).toHaveBeenCalledWith(500)
    expect(mockResponse.send).toHaveBeenCalledWith({
      error: 'Something went wrong on the server',
    })
  })

  it('should handle different types of errors', () => {
    const testError = new TypeError('Type error')

    errorHandler(
      testError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    )

    expect(consoleErrorSpy).toHaveBeenCalledWith(testError)
    expect(mockResponse.status).toHaveBeenCalledWith(500)
    expect(mockResponse.send).toHaveBeenCalledWith({
      error: 'Something went wrong on the server',
    })
  })

  it('should not call next function', () => {
    const testError = new Error('Test error')

    errorHandler(
      testError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    )

    expect(mockNext).not.toHaveBeenCalled()
  })
})
