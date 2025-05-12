import { randomBytes } from 'node:crypto'
import type { Context } from 'hono'
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie'
import { env } from '~/lib/env'

const SESSION_COOKIE_NAME = 'sessionId'

export function generateSessionId() {
	return randomBytes(64).toString('hex')
}

export async function setSessionCookie(c: Context, sessionId: string) {
	await setSignedCookie(c, SESSION_COOKIE_NAME, sessionId, env.SIGNATURE, {
		path: '/',
		secure: true,
		httpOnly: true,
		sameSite: 'Strict',
		maxAge: 60 * 60 * 24 * 365,
	})
}

export async function getSessionIdFromCookie(c: Context) {
	return await getSignedCookie(c, env.SIGNATURE, SESSION_COOKIE_NAME)
}

export function deleteSessionCookie(c: Context) {
	deleteCookie(c, SESSION_COOKIE_NAME)
}
