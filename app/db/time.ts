import { timestamp } from 'drizzle-orm/pg-core'

// always store timestamp with timezone in UTC
export function timestamptz(columnName: string) {
	return timestamp(columnName, { withTimezone: true })
}
