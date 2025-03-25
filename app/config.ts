import Bun from 'bun'
import { z } from 'zod'

const schema = z.object({
	DATABASE_URL: z.string().url(),
	ORIGIN: z.string().min(1),
	SIGNATURE: z.string().min(1),
	ENV: z.enum(['development', 'production']),
})

export const config = schema.parse({
	DATABASE_URL: Bun.env.DATABASE_URL,
	ORIGIN: Bun.env.ORIGIN,
	SIGNATURE: Bun.env.SIGNATURE,
	ENV: Bun.env.ENV,
})
