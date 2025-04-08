import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { HTTPException } from 'hono/http-exception'
import type { z } from 'zod'
import { db } from '~/database'
import { users } from '../users/models'
import { sessions } from './models'
import type { loginRequest, registerRequest } from './schemas'
import { generateSessionId } from './utils'

export async function login(req: z.infer<typeof loginRequest>) {
	const [user] = await db.select().from(users).where(eq(users.email, req.email))
	if (!user) {
		throw new HTTPException(401, {
			message: 'Invalid username or password',
		})
	}

	const passwordMatch = await bcrypt.compare(req.password, user.passwordHash)
	if (!passwordMatch) {
		throw new HTTPException(401, {
			message: 'Invalid username or password',
		})
	}

	const sessionId = generateSessionId()

	await db.insert(sessions).values({ userId: user.id, sessionId })

	return sessionId
}

export async function register(req: z.infer<typeof registerRequest>) {
	const [existingUser] = await db.select().from(users).where(eq(users.email, req.email))

	if (existingUser) {
		throw new HTTPException(409, {
			message: 'Sorry, that email is taken',
		})
	}

	const passwordHash = await bcrypt.hash(req.password, 12)

	await db.insert(users).values({ email: req.email, name: req.name, passwordHash })
}

export async function logout(sessionId: string) {
	await db.delete(sessions).where(eq(sessions.sessionId, sessionId))
}
