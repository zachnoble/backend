import { z } from 'zod'

const schema = z
	.object({
		// Environment
		NODE_ENV: z.enum(['development', 'production', 'test']),

		// App config
		PORT: z.coerce.number().default(8080),
		ORIGIN: z.string().min(1).default('http://localhost:3000'),
		SIGNATURE: z.string().min(1),

		// Database config
		DB_USER: z.string().min(1),
		DB_PASSWORD: z.string().min(1),
		DB_HOST: z.string().min(1).default('localhost'),
		DB_NAME: z.string().min(1).default('postgres'),
		DB_PORT: z.coerce.number().default(5432),

		// GCP config
		GCP_INSTANCE_CONNECTION_NAME: z.string().optional(),
		GCP_PROJECT_ID: z.string().optional(),
		GCP_RECAPTCHA_API_KEY: z.string().optional(),
		GCP_RECAPTCHA_SITE_KEY: z.string().optional(),

		// Email with Resend
		RESEND_API_KEY: z.string().min(1),
		EMAIL_FROM: z.string().email(),
	})
	.superRefine((data, ctx) => {
		if (data.NODE_ENV === 'production') {
			if (!data.GCP_INSTANCE_CONNECTION_NAME) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'GCP_INSTANCE_CONNECTION_NAME is required in production',
					path: ['GCP_INSTANCE_CONNECTION_NAME'],
				})
			}
			if (!data.GCP_PROJECT_ID) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'GCP_PROJECT_ID is required in production',
					path: ['GCP_PROJECT_ID'],
				})
			}
			if (!data.GCP_RECAPTCHA_API_KEY) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'GCP_RECAPTCHA_API_KEY is required in production',
					path: ['GCP_RECAPTCHA_API_KEY'],
				})
			}
			if (!data.GCP_RECAPTCHA_SITE_KEY) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'GCP_RECAPTCHA_SITE_KEY is required in production',
					path: ['GCP_RECAPTCHA_SITE_KEY'],
				})
			}
		}
	})

export const env = schema.parse(Bun.env)
