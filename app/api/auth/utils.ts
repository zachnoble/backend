import type { Context } from 'hono'
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie'
import { config } from '~/config'

const sessionCookieName = 'sessionId'

export function generateSessionId() {
	const array = new Uint8Array(32)
	crypto.getRandomValues(array)
	return Array.from(array)
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('')
}

export async function setSessionCookie(c: Context, sessionId: string) {
	await setSignedCookie(c, sessionCookieName, sessionId, config.SIGNATURE, {
		path: '/',
		secure: true,
		httpOnly: true,
		sameSite: 'Strict',
	})
}

export async function getSessionIdFromCookie(c: Context) {
	const sessionId = await getSignedCookie(c, config.SIGNATURE, sessionCookieName)
	return sessionId || null
}

export function deleteSessionCookie(c: Context) {
	deleteCookie(c, sessionCookieName)
}
