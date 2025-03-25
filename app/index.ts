import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { config } from '~/config'
import { router as authRouter } from './api/auth/controllers'
import { errorHandler } from './middleware/error-handler'
import { loggerMiddleware } from './middleware/logger'

const app = new Hono()
	.basePath('/api')
	.use(
		cors({
			origin: config.ORIGIN,
			allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
			credentials: true,
		}),
	)
	.use('*', loggerMiddleware())
	.onError(errorHandler)
	.route('/', authRouter)

export default app
