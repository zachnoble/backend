import pino, { type LoggerOptions } from 'pino'
import { config } from '~/config'

const isDevelopment = config.ENV === 'development'

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
