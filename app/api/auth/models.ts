import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { defaultColumns } from '~/db/default-columns'
import { users } from '../users/models'

/**
 * A table to store session ids for authentication.
 * Session IDs are generated when the user logs in, and sent as a cookie to the client.
 * Session IDs are deleted when the user logs out.
 */
export const sessions = pgTable(
	'sessions',
	{
		sessionId: text('session_id').primaryKey(),
		userId: uuid('user_id').references(() => users.id),
		...defaultColumns(),
	},
	(table) => [index('sessions_user_id_idx').on(table.userId)],
)

/**
 * A table to store email verification tokens for authentication.
 * Tokens are generated when the user registers, and sent as a link to the user's email address.
 * Tokens are only considered valid for 24 hours.
 */
export const emailVerificationTokens = pgTable(
	'email_verification_tokens',
	{
		token: text('token').primaryKey(),
		userId: uuid('user_id')
			.references(() => users.id)
			.notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		...defaultColumns(),
	},
	(table) => [index('email_verification_tokens_user_id_idx').on(table.userId)],
)

/**
 * A table to store password reset tokens for authentication.
 * Tokens are generated when the user requests a password reset, and sent as a link to the user's email address.
 * Tokens are only considered valid for 24 hours.
 */
export const passwordResetTokens = pgTable(
	'password_reset_tokens',
	{
		token: text('token').primaryKey(),
		userId: uuid('user_id')
			.references(() => users.id)
			.notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		...defaultColumns(),
	},
	(table) => [index('password_reset_tokens_user_id_idx').on(table.userId)],
)
