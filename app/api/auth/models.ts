import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { defaultColumns } from '~/db/default-columns'
import { users } from '../users/models'

export const sessions = pgTable(
	'sessions',
	{
		sessionId: text('session_id').primaryKey(),
		userId: uuid('user_id').references(() => users.id),
		...defaultColumns(),
	},
	(table) => [index('sessions_user_id_idx').on(table.userId)],
)
