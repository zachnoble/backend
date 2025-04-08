import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import { logger } from '../lib/logger'

function getZodErrorMessages(error: ZodError) {
	return error.errors.map((err) => err.message).join('\n')
}

export function errorHandler(err: Error) {
	logger.error(err)

	let message = 'Uh, oh. Something went wrong.'
	let status = 500

	if (err instanceof HTTPException) {
		status = err.status
		message = err.message
	}

	if (err.cause instanceof ZodError) {
		status = 422
		message = getZodErrorMessages(err.cause)
	}

	const response = {
		error: {
			message,
			status,
		},
	}

	return new Response(JSON.stringify(response), {
		status,
	})
}
