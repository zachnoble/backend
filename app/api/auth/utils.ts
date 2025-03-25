import type { Context } from 'hono'
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie'
import { config } from '~/config'

const sessionCookieName = 'sessionId'

export const generateSessionId = () => {
	const array = new Uint8Array(32)
	crypto.getRandomValues(array)
	return Array.from(array)
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('')
}

export const setSessionCookie = async (c: Context, sessionId: string) => {
	await setSignedCookie(c, sessionCookieName, sessionId, config.SIGNATURE, {
		path: '/',
		secure: true,
		httpOnly: true,
		sameSite: 'Strict',
	})
}

export const getSessionIdFromCookie = async (c: Context) => {
	const sessionId = await getSignedCookie(c, config.SIGNATURE, sessionCookieName)
	return sessionId || null
}

export const deleteSessionCookie = (c: Context) => {
	deleteCookie(c, sessionCookieName)
}
