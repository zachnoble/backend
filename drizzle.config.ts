import { defineConfig } from 'drizzle-kit'
import { env } from '~/lib/env'

export default defineConfig({
	out: './migrations',
	schema: './app/**/models.ts',
	dialect: 'postgresql',
	dbCredentials: {
		user: env.DB_USER,
		password: env.DB_PASSWORD,
		host: env.DB_HOST,
		port: env.DB_PORT,
		database: env.DB_NAME,
		ssl: false,
	},
})
