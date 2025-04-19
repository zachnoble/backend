import type { Context as HonoContext } from 'hono'

declare module 'hono' {
	interface Context extends HonoContext {
		user: {
			id: string
			name: string
			email: string
		}
	}
}
