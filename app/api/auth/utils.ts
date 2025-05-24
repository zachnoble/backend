import { randomBytes } from 'node:crypto'
import { eq } from 'drizzle-orm'
import type { Context } from 'hono'
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie'
import { db } from '~/db'
import { env } from '~/lib/env'
import { users } from '../users/models'
import { emailVerificationTokens, passwordResetTokens } from './models'

/**
 * The name of the cookie that stores the session id.
 */
const SESSION_COOKIE_NAME = 'sessionId'

/**
 * The expiration time of verification and password reset tokens.
 */
const TOKEN_EXPIRATION_TIME = 24 * 60 * 60 * 1000 // 24 hours

/**
 * The expiration time of the session id cookie.
 */
const SESSION_EXPIRATION_TIME = 60 * 60 * 24 * 365 // 1 year

/**
 * Generate a long, cryptographically secure token.
 * Can be used for session IDs, verification tokens, etc.
 */
export function generateSecureToken() {
	return randomBytes(64).toString('hex')
}

/**
 * Set the session id cookie in the response to the client.
 */
export async function setSessionCookie(c: Context, sessionId: string) {
	await setSignedCookie(c, SESSION_COOKIE_NAME, sessionId, env.SIGNATURE, {
		path: '/',
		secure: true,
		httpOnly: true,
		sameSite: 'Strict',
		maxAge: SESSION_EXPIRATION_TIME,
	})
}

/**
 * Parse the session id from the cookie in the request.
 */
export async function getSessionIdFromCookie(c: Context) {
	return await getSignedCookie(c, env.SIGNATURE, SESSION_COOKIE_NAME)
}

/**
 * Delete the session id cookie from the response to the client.
 * Used when the user logs out.
 */
export function deleteSessionCookie(c: Context) {
	deleteCookie(c, SESSION_COOKIE_NAME)
}

/**
 * Generate an account verification token for the user.
 * Sent to the user's email address when they register.
 */
export async function generateVerificationToken(userId: string) {
	await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, userId))

	const token = generateSecureToken()
	const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_TIME)

	await db.insert(emailVerificationTokens).values({
		token,
		userId,
		expiresAt,
	})

	return token
}

/**
 * Generate a password reset token when requested by the user.
 * If the user does not exist, the token is not generated.
 * We do not error out to avoid leaking information about the existence of an account.
 */
export async function generatePasswordResetToken(email: string) {
	const [user] = await db.select().from(users).where(eq(users.email, email))

	if (!user) return
	await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id))

	const token = generateSecureToken()
	const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_TIME)

	await db.insert(passwordResetTokens).values({
		token,
		userId: user.id,
		expiresAt,
	})

	return token
}
