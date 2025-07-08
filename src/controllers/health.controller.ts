import { NextFunction, Request, Response } from 'express'

export const liveness = (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send({ status: 'ok' })
}

export const readyness = (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send({ status: 'ok' })
}
