import { Hono } from 'hono'
import { success } from '~/lib/responses'
import { authenticate } from '~/middleware/auth'
import { validate } from '~/middleware/validate'
import { schemas } from './schemas'
import { createSession, login, logout, register } from './services'
import { deleteSessionCookie, getSessionIdFromCookie, setSessionCookie } from './utils'

export const hono = new Hono()

hono.post('/login', validate('json', schemas.login), async (c) => {
	const body = c.req.valid('json')

	const sessionId = await login(body)
	await setSessionCookie(c, sessionId)

	return success(c)
})

hono.post('/register', validate('json', schemas.register), async (c) => {
	const body = c.req.valid('json')

	const user = await register(body)
	const sessionId = await createSession(user.id)
	await setSessionCookie(c, sessionId)

	return success(c)
})

hono.post('/logout', authenticate, async (c) => {
	const sessionId = await getSessionIdFromCookie(c)

	if (sessionId) {
		deleteSessionCookie(c)
		await logout(sessionId)
	}

	return success(c)
})

hono.get('/user', authenticate, (c) => c.json(c.user))
