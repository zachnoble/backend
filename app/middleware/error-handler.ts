import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { StatusCode } from 'hono/utils/http-status'
import { ZodError } from 'zod'
import { logger } from '../lib/logger'

export function errorHandler(err: Error, c: Context) {
	logger.error(err)

	let message = 'Uh, oh. Something went wrong.'
	let status: StatusCode = 500

	if (err instanceof HTTPException) {
		status = err.status
		message = err.message
	}

	if (err.cause instanceof ZodError) {
		status = 422
		message = err.cause.errors.map((err) => err.message).join('\n')
	}

	return c.json(
		{
			error: {
				message,
				status,
			},
		},
		status,
	)
}
