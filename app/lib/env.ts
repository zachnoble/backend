import { z } from 'zod'

const schema = z
	.object({
		// Environment
		NODE_ENV: z.enum(['development', 'production']),

		// App level config
		PORT: z.coerce.number().default(8080),
		ORIGIN: z.string().min(1).default('http://localhost:3000'),
		SIGNATURE: z.string().min(1),

		// Database config
		DB_USER: z.string().min(1),
		DB_PASSWORD: z.string().min(1),
		DB_HOST: z.string().min(1).default('localhost'),
		DB_NAME: z.string().min(1).default('postgres'),
		DB_PORT: z.coerce.number().default(5432),

		// GCP Cloud Run / Cloud SQL config
		GCP_INSTANCE_CONNECTION_NAME: z.string().optional(),
	})
	.refine(
		(data) => {
			if (data.NODE_ENV === 'production') {
				return data.GCP_INSTANCE_CONNECTION_NAME != null
			}
			return true
		},
		{
			message: 'GCP_INSTANCE_CONNECTION_NAME is required in production',
			path: ['GCP_INSTANCE_CONNECTION_NAME'],
		},
	)

export const env = schema.parse(Bun.env)
