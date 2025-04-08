import { defineConfig } from 'drizzle-kit'
import { config } from '~/config'

export default defineConfig({
	out: './app/migrations',
	schema: './app/**/models.ts',
	dialect: 'postgresql',
	dbCredentials: {
		url: config.DATABASE_URL,
	},
})
