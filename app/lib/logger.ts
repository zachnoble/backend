import pino from 'pino'
import { config } from '~/config'

const isDevelopment = config.ENV === 'development'

const settings = isDevelopment
	? {
			transport: {
				target: 'pino-pretty',
				options: {
					colorize: true,
					messageFormat: '{msg}',
					singleLine: false,
				},
			},
		}
	: undefined

export const logger = pino(settings)
