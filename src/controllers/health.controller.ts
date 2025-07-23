import { NextFunction, Request, Response } from 'express'
import * as os from 'os'

export const liveness = (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send({
    status: 'ok',
    instance: os.hostname(),
    timestamp: new Date().toISOString(),
  })
}

export const readyness = (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send({
    status: 'ok',
    instance: os.hostname(),
    timestamp: new Date().toISOString(),
  })
}
