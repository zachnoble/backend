import { timestamptz } from './time'

export function defaultColumns() {
	return {
		createdAt: timestamptz('created_at').notNull().defaultNow(),
		updatedAt: timestamptz('updated_at')
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	}
}
