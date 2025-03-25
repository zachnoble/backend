import type { ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import { logger } from '../lib/logger'

type FieldError = {
	message: string
}

interface ErrorResponse {
	error: {
		message: string
		status: number
		fields?: {
			[field: string]: FieldError
		}
	}
}

function getFieldErrors(error: ZodError) {
	const fields: ErrorResponse['error']['fields'] = {}

	error.errors.forEach((err) => {
		const field = err.path[err.path.length - 1]
		fields[field] = {
			message: err.message,
		}
	})

	return fields
}

export const errorHandler: ErrorHandler = (err) => {
	logger.error(err)

	let message = 'Uh, oh. Something went wrong.'
	let status = 500

	let fields: ErrorResponse['error']['fields'] = undefined

	if (err instanceof HTTPException) {
		status = err.status
		message = err.message
	}

	if (err.cause instanceof ZodError) {
		status = 422
		message = 'One or more fields are invalid'
		fields = getFieldErrors(err.cause)
	}

	const response: ErrorResponse = {
		error: {
			message,
			status,
			fields,
		},
	}

	return new Response(JSON.stringify(response), {
		status,
	})
}
