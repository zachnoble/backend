import { drizzle } from 'drizzle-orm/node-postgres'
import { timestamp } from 'drizzle-orm/pg-core'
import { Pool } from 'pg'
import { config } from '~/config'

const pool = new Pool({
	connectionString: config.DATABASE_URL,
})

export const db = drizzle(pool)

export function defaultColumns() {
	return {
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	}
}
