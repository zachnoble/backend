// biome-ignore lint/correctness/noUnusedImports: is used
import { Context } from 'hono'

interface User {
	id: string
	name: string
	email: string
}

declare module 'hono' {
	interface Context {
		user: User
	}
}
