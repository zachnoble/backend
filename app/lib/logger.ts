import pino, { type LoggerOptions } from 'pino'
import { env } from '~/lib/env'

const isDevelopment = env.NODE_ENV === 'development'

const developmentSettings: LoggerOptions = {
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
		},
	},
}

const productionSettings: LoggerOptions = {}

export const logger = pino(isDevelopment ? developmentSettings : productionSettings)
