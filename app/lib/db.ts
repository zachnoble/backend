import { drizzle } from 'drizzle-orm/node-postgres'
import { timestamp } from 'drizzle-orm/pg-core'
import { config } from '~/config'

export const db = drizzle(config.DATABASE_URL)

export const defaultColumns = () => ({
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
})
