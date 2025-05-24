import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { HTTPException } from 'hono/http-exception'
import type { z } from 'zod'
import { db } from '~/db'
import { users } from '../users/models'
import { sendVerificationEmail } from './emails/account-verification'
import { emailVerificationTokens, passwordResetTokens, sessions } from './models'
import type { schemas } from './schemas'
import { generateSecureToken, generateVerificationToken } from './utils'

/**
 * Login the user and return a Session ID to authenticate the user.
 * Error if the user does not exist, the password is incorrect, or the user is not verified.
 */
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

	if (!user.isVerified) {
		throw new HTTPException(403, {
			message:
				'Email not verified. Please check your email for a verification link, or register again.',
		})
	}

	const sessionId = generateSecureToken()

	await db.insert(sessions).values({ userId: user.id, sessionId })

	return sessionId
}

/**
 * Register a new user.
 * If the user already exists, and is not verified, they are deleted and a new verification email is sent.
 * If the user already exists, and is verified, they are not registered again.
 */
export async function register({ email, name, password }: z.infer<typeof schemas.register>) {
	const [existingUser] = await db.select().from(users).where(eq(users.email, email))

	if (existingUser) {
		if (!existingUser.isVerified) {
			await db
				.delete(emailVerificationTokens)
				.where(eq(emailVerificationTokens.userId, existingUser.id))
			await db.delete(users).where(eq(users.email, email))
		} else {
			throw new HTTPException(409, {
				message: 'Sorry, that email address is already taken.',
			})
		}
	}

	const passwordHash = await bcrypt.hash(password, 12)

	const [user] = await db.insert(users).values({ email, name, passwordHash }).returning()

	return user
}

/**
 * Logout the user by deleting the session id from the database.
 * We don't care if the session id does not exist.
 */
export async function logout(sessionId: string) {
	await db.delete(sessions).where(eq(sessions.sessionId, sessionId))
}

/**
 * Reset the user's password.
 * In order to reset the password, the user must have a valid password reset token.
 * If the token is invalid, expired, or the user does not exist, the password is not reset.
 */
export async function resetPassword({
	token,
	email,
	password,
}: z.infer<typeof schemas.resetPassword>) {
	const message = 'Invalid or expired password reset link. Please request a new one.'

	const [resetToken] = await db
		.select()
		.from(passwordResetTokens)
		.where(eq(passwordResetTokens.token, token))

	if (!resetToken) {
		throw new HTTPException(400, {
			message,
		})
	}

	if (resetToken.expiresAt < new Date()) {
		throw new HTTPException(400, {
			message,
		})
	}

	const [user] = await db.select().from(users).where(eq(users.id, resetToken.userId))
	if (!user || user.email !== email) {
		throw new HTTPException(400, {
			message,
		})
	}

	const passwordHash = await bcrypt.hash(password, 12)
	await db.update(users).set({ passwordHash }).where(eq(users.id, user.id))
	await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token))
}

/**
 * Verify the user's account.
 * In order to verify the account, the user must have a valid email verification token.
 * If the token is invalid, expired, or the user does not exist, the user is not verified.
 */
export async function verifyEmail({ token, email }: z.infer<typeof schemas.verifyEmail>) {
	const [verificationToken] = await db
		.select()
		.from(emailVerificationTokens)
		.where(eq(emailVerificationTokens.token, token))

	if (!verificationToken) {
		throw new HTTPException(400, {
			message:
				"Unable to verify email. If you haven't already verified your account, try to register again.",
		})
	}

	if (verificationToken.expiresAt < new Date()) {
		const token = await generateVerificationToken(verificationToken.userId)
		await sendVerificationEmail(email, token)
		throw new HTTPException(400, {
			message: 'Verification email expired. We sent a new one to your email address!',
		})
	}

	await db.update(users).set({ isVerified: true }).where(eq(users.id, verificationToken.userId))

	await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.token, token))
}
