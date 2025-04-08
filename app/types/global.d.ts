import type { Context as HonoContext } from 'hono'

interface User {
	id: string
	name: string
	email: string
}

declare module 'hono' {
	interface Context extends HonoContext {
		user: User
	}
}
