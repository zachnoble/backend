import { Hono } from 'hono'
import { routes } from './api/routes'
import { env } from './lib/env'
import { cors } from './middleware/cors'
import { errorHandler } from './middleware/error-handler'
import { loggerMiddleware } from './middleware/logger'
import { notFound } from './middleware/not-found'

export const app = new Hono()
	.use(cors)
	.use(loggerMiddleware)
	.onError(errorHandler)
	.notFound(notFound)
	.route('/', routes)

export default {
	port: env.PORT,
	fetch: app.fetch,
} satisfies Bun.ServeOptions
