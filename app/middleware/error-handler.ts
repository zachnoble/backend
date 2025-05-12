import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { StatusCode } from 'hono/utils/http-status'
import { ZodError } from 'zod'
import { logger } from '../lib/logger'

function formatZodError(error: ZodError) {
	return error.errors
		.map((e) => {
			const fieldPath = e.path.join('.')
			return `${fieldPath}: ${e.message}`
		})
		.join('\n')
}

export function errorHandler(err: Error, c: Context) {
	logger.error(err)

	let message = 'An unexpected error occurred.'
	let status: StatusCode = 500

	if (err instanceof HTTPException) {
		status = err.status
		message = err.message
	}

	if (err.cause instanceof ZodError) {
		status = 422
		message = formatZodError(err.cause)
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
