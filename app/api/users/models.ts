import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { defaultColumns } from '~/lib/db'

export const users = pgTable('users', {
	id: uuid().defaultRandom().primaryKey(),
	email: text().notNull().unique(),
	name: text().notNull(),
	passwordHash: text('password_hash').notNull(),
	...defaultColumns(),
})
