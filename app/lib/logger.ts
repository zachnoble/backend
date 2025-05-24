import pino, { type LoggerOptions } from 'pino'
import { env } from '~/lib/env'

const developmentSettings: LoggerOptions = {
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
		},
	},
}

const productionSettings: LoggerOptions = {}

const testSettings: LoggerOptions = {
	level: 'silent',
}

const settings: Record<string, LoggerOptions> = {
	development: developmentSettings,
	production: productionSettings,
	test: testSettings,
}

export const logger = pino(settings[env.NODE_ENV])
