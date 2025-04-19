import { sql } from 'drizzle-orm'
import { Hono } from 'hono'
import type { StatusCode } from 'hono/utils/http-status'
import { db } from '~/database'
import { logger } from '~/lib/logger'

export const hono = new Hono()

hono.get('/', async (c) => {
	let status: StatusCode = 200
	let message = 'Service is running'

	try {
		await db.execute(sql`SELECT 1`)
	} catch (error) {
		logger.error(error)
		status = 500
		message = 'Unable to connect to database'
	}

	return c.json(
		{
			status,
			message,
			timestamp: new Date().toISOString(),
		},
		status,
	)
})
