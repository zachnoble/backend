import { timestamptz } from './time'

/**
 * Default columns to be used for all tables.
 * Enables automatic tracking for when a row was created and updated.
 */
export function defaultColumns() {
	return {
		createdAt: timestamptz('created_at').notNull().defaultNow(),
		updatedAt: timestamptz('updated_at')
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	}
}
