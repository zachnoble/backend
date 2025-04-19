import { randomBytes } from 'node:crypto'
import type { Context } from 'hono'
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie'
import { config } from '~/config'

const SESSION_COOKIE_NAME = 'sessionId'

export function generateSessionId() {
	return randomBytes(64).toString('hex')
}

export async function setSessionCookie(c: Context, sessionId: string) {
	await setSignedCookie(c, SESSION_COOKIE_NAME, sessionId, config.SIGNATURE, {
		path: '/',
		secure: true,
		httpOnly: true,
		sameSite: 'Strict',
	})
}

export async function getSessionIdFromCookie(c: Context) {
	return await getSignedCookie(c, config.SIGNATURE, SESSION_COOKIE_NAME)
}

export function deleteSessionCookie(c: Context) {
	deleteCookie(c, SESSION_COOKIE_NAME)
}
