import { z } from 'zod'

const schema = z.object({
	ENV: z.enum(['development', 'production']),
	PORT: z.coerce.number().default(8080),
	DATABASE_URL: z.string().url(),
	ORIGIN: z.string().min(1),
	SIGNATURE: z.string().min(1),
})

export const config = schema.parse({
	ENV: process.env.ENV,
	PORT: process.env.PORT,
	DATABASE_URL: process.env.DATABASE_URL,
	ORIGIN: process.env.ORIGIN,
	SIGNATURE: process.env.SIGNATURE,
})
