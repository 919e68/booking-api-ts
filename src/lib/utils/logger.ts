import path from 'path'
import winston from 'winston'

const logFile = (name: string) => {
  return path.resolve('logs', name)
}

export const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'backend' },
  transports: [
    new winston.transports.File({ filename: logFile('error.log'), level: 'error' }),
    new winston.transports.File({ filename: logFile('combined.log') })
  ]
})

const format = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align()
)

if (process.env.NODE_ENV === 'development') {
  logger.add(
    new winston.transports.Console({
      format
    })
  )
}
