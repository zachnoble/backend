import { Hono } from 'hono'
import { routes } from './api/routes'
import { config } from './config'
import { cors } from './middleware/cors'
import { errorHandler } from './middleware/error-handler'
import { loggerMiddleware } from './middleware/logger'
import { notFound } from './middleware/not-found'

const app = new Hono()
	.use(cors)
	.use(loggerMiddleware)
	.onError(errorHandler)
	.route('/', routes)
	.notFound(notFound)

export default {
	port: config.PORT,
	fetch: app.fetch,
}
