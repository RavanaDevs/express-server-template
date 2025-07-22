import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import healthRouter from './routes/health.route'
import { errorHandler } from './middlewares/error-handler'

export const app = express()

app.use(cors())
app.use(express.json())

app.use('/health', healthRouter)

app.get('/', (req, res) => {
  throw new Error('Something went wrong')
  res.send('Hello World!')
})

app.use(errorHandler)
