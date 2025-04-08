import { z } from 'zod'

const schema = z.object({
	DATABASE_URL: z.string().url(),
	ORIGIN: z.string().min(1),
	SIGNATURE: z.string().min(1),
	ENV: z.enum(['development', 'production']),
})

export const config = schema.parse({
	DATABASE_URL: process.env.DATABASE_URL,
	ORIGIN: process.env.ORIGIN,
	SIGNATURE: process.env.SIGNATURE,
	ENV: process.env.ENV,
})
