import 'dotenv/config'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import { errors as celebrateErrors } from 'celebrate'

import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import pinoHttp from 'pino-http'
import cookieParser from 'cookie-parser'

import logger from './src/logger.js'

import authRouter from './src/routes/auth.routes.js'
import announcementsRouter from './src/routes/announcements.routes.js'

const app = express()

// =========================
// SECURITY
// =========================

app.use(helmet())

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS.split(','),
    credentials: true,
  })
)

// =========================
// LOGGING
// =========================

app.use(
  pinoHttp({
    logger,
  })
)

// =========================
// BODY PARSERS
// =========================

app.use(express.json())
app.use(cookieParser())

// =========================
// RATE LIMIT FOR AUTH
// =========================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error:
      'Too many requests, please try again later',
  },
})

// =========================
// SWAGGER
// =========================

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'REST API',
      version: '1.0.0',
      description: 'REST API documentation',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
}

const swaggerSpec = swaggerJsdoc(
  swaggerOptions
)

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
)

// =========================
// VALIDATION ERRORS
// =========================

app.use(celebrateErrors())

// =========================
// ROUTES
// =========================

app.use(
  '/auth',
  authLimiter,
  authRouter
)

app.use(
  '/announcements',
  announcementsRouter
)

// =========================
// 404
// =========================

app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
  })
})

// =========================
// ERROR HANDLER
// =========================

app.use((err, req, res, next) => {
  console.error(
    '========== ERROR =========='
  )
  console.error(err)
  console.error(err.stack)
  console.error(
    '==========================='
  )

  if (
    err.type === 'entity.parse.failed' &&
    err.status === 400
  ) {
    return res.status(400).json({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid JSON',
    })
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Resource not found',
    })
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Unique constraint violation',
    })
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      error: 'Foreign key constraint failed',
    })
  }

  if (err.status) {
    return res.status(err.status).json({
      error: err.message,
    })
  }

  res.status(500).json({
    error:
      err.message ||
      'Internal server error',
  })
})

// =========================
// START SERVER
// =========================

const PORT =
  process.env.PORT || 3000

app.listen(PORT, () => {
  logger.info(
    `Server is running on port ${PORT}`
  )

  logger.info(
    `API docs: http://localhost:${PORT}/api-docs`
  )
})