import type { Context } from 'hono'
import { logger } from '~/lib/logger'

export function notFound(c: Context) {
	const { method, path } = c.req

	const ignoredPaths = ['/favicon.ico']

	if (!ignoredPaths.includes(path)) {
		logger.warn(`${method} ${path} Not Found`)
	}

	return c.json('Not found', 404)
}
