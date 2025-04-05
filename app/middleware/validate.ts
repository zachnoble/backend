import { zValidator } from '@hono/zod-validator'
import type { ValidationTargets } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { ZodSchema } from 'zod'

export function validate<T extends ZodSchema, Target extends keyof ValidationTargets>(
	target: Target,
	schema: T,
) {
	return zValidator(target, schema, (result) => {
		if (!result.success) {
			throw new HTTPException(422, {
				cause: result.error,
			})
		}
	})
}
