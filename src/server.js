// server.js
import express from 'express'
import cors from 'cors'
import router from './router.js'
import logger from './lib/logger.js'
import morgan from 'morgan'


const app = express()

app.use(cors())

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors({ credentials: false }))

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.get('/', (req, res) => {
  res.send('This is AI app service')
  // setTimeout(() => {
  //   next(new Error('hello error here'))
  // }, 1)
})

const API_PREFIX = '/api'
app.use(`${API_PREFIX}`, router)

// Updated error handling middleware
app.use((err, req, res) => {
  logger.error(err)
  res.status(500).json({ message: `An error occurred: ${err.message}` })
})

export default app
