import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { config } from '~/config'
import { routes } from './api/routes'
import { errorHandler } from './middleware/error-handler'
import { loggerMiddleware } from './middleware/logger'

const app = new Hono()
	.use(
		cors({
			origin: config.ORIGIN,
			allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
			credentials: true,
		}),
	)
	.use(loggerMiddleware())
	.onError(errorHandler)
	.route('/', routes)

export default app
