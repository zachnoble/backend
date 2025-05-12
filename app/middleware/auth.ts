import { eq } from 'drizzle-orm'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { sessions } from '~/api/auth/models'
import { getSessionIdFromCookie } from '~/api/auth/utils'
import { users } from '~/api/users/models'
import { db } from '~/db'

type User = {
	id: string
	name: string
	email: string
}

declare module 'hono' {
	interface Context {
		user: User
	}
}

export const authenticate = createMiddleware(async (c, next) => {
	const sessionId = await getSessionIdFromCookie(c)

	if (!sessionId) {
		throw new HTTPException(401, {
			message: 'Session ID missing in request',
		})
	}

	const [user] = await db
		.select({ id: users.id, name: users.name, email: users.email })
		.from(sessions)
		.innerJoin(users, eq(users.id, sessions.userId))
		.where(eq(sessions.sessionId, sessionId))

	if (!user) {
		throw new HTTPException(401, {
			message: 'Session does not exist',
		})
	}

	c.user = user satisfies User

	await next()
})
