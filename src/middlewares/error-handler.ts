import { Request, Response, NextFunction } from 'express'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err)
  res.status(500).send({
    error: 'Something went wrong on the server',
  })
}
