import { Hono } from 'hono'
import { success } from '~/lib/responses'
import { authenticate } from '~/middleware/auth'
import { validate } from '~/middleware/validate'
import { loginRequest, registerRequest } from './schemas'
import { login, logout, register } from './services'
import { deleteSessionCookie, getSessionIdFromCookie, setSessionCookie } from './utils'

export const router = new Hono()
	.post('/login', validate('json', loginRequest), async (c) => {
		const body = c.req.valid('json')

		const sessionId = await login(body)
		await setSessionCookie(c, sessionId)

		return success(c)
	})
	.post('/register', validate('json', registerRequest), async (c) => {
		const body = c.req.valid('json')

		await register(body)

		return success(c)
	})
	.post('/logout', authenticate, async (c) => {
		const sessionId = await getSessionIdFromCookie(c)

		if (sessionId) {
			deleteSessionCookie(c)
			logout(sessionId)
		}

		return success(c)
	})
	.get('/user', authenticate, (c) => c.json(c.user))
