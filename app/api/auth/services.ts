import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { HTTPException } from 'hono/http-exception'
import type { z } from 'zod'
import { db } from '~/database'
import { users } from '../users/models'
import { sessions } from './models'
import type { schemas } from './schemas'
import { generateSessionId } from './utils'

export async function createSession(userId: string) {
	const sessionId = generateSessionId()

	await db.insert(sessions).values({ userId, sessionId })

	return sessionId
}

export async function login({ email, password }: z.infer<typeof schemas.login>) {
	const [user] = await db.select().from(users).where(eq(users.email, email))
	if (!user) {
		throw new HTTPException(401, {
			message: 'Invalid username or password',
		})
	}

	const passwordMatch = await bcrypt.compare(password, user.passwordHash)
	if (!passwordMatch) {
		throw new HTTPException(401, {
			message: 'Invalid username or password',
		})
	}

	const sessionId = await createSession(user.id)

	return sessionId
}

export async function register({ email, name, password }: z.infer<typeof schemas.register>) {
	const [existingUser] = await db.select().from(users).where(eq(users.email, email))

	if (existingUser) {
		throw new HTTPException(409, {
			message: 'Sorry, that email is taken',
		})
	}

	const passwordHash = await bcrypt.hash(password, 12)

	const [user] = await db.insert(users).values({ email, name, passwordHash }).returning()

	return user
}

export async function logout(sessionId: string) {
	await db.delete(sessions).where(eq(sessions.sessionId, sessionId))
}
