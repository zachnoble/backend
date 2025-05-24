import { describe, expect, it } from 'bun:test'
import { eq } from 'drizzle-orm'
import { emailVerificationTokens, passwordResetTokens } from '~/api/auth/models'
import { users } from '~/api/users/models'
import { db } from '~/db'
import { createTestClient } from './lib/test-client'

describe('Auth Routes', () => {
	const testUser = {
		email: 'test@example.com',
		password: 'Test123!@#$',
		name: 'Test User',
	}
	const testClient = createTestClient({ prefix: '/auth' })

	describe('POST /auth/register', () => {
		it('should register a new user and create a verification token', async () => {
			// Register a new user
			const { status } = await testClient.post('/register', testUser)
			expect(status).toBe(200)

			// Verify the user is created in the database
			const [user] = await db.select().from(users).where(eq(users.email, testUser.email))
			expect(user).toBeDefined()
			expect(user.isVerified).toBe(false)

			// Verify the verification token is created in the database
			const [verificationToken] = await db
				.select()
				.from(emailVerificationTokens)
				.where(eq(emailVerificationTokens.userId, user.id))
			expect(verificationToken).toBeDefined()
			expect(verificationToken.token).toBeDefined()
			expect(verificationToken.expiresAt).toBeDefined()
			expect(verificationToken.expiresAt > new Date()).toBe(true)
		})

		it('should not register user with existing verified email', async () => {
			const [user] = await db.select().from(users).where(eq(users.email, testUser.email))
			await db.update(users).set({ isVerified: true }).where(eq(users.id, user.id))

			const { status } = await testClient.post('/register', testUser)
			expect(status).toBe(409)
		})

		it('should allow re-registration with existing unverified email', async () => {
			const unverifiedUser = {
				email: 'unverified@example.com',
				password: 'Test123!@#$',
				name: 'Unverified User',
			}
			await testClient.post('/register', unverifiedUser)
			const { status } = await testClient.post('/register', unverifiedUser)
			expect(status).toBe(200)
		})

		it('should reject registration with invalid email', async () => {
			const { status } = await testClient.post('/register', {
				...testUser,
				email: 'invalid-email',
			})
			expect(status).toBe(422)
		})

		it('should reject registration with weak password', async () => {
			const { status } = await testClient.post('/register', {
				...testUser,
				email: 'weakpass@example.com',
				password: '123', // Too short
			})
			expect(status).toBe(422)
		})

		it('should reject registration with missing name', async () => {
			const { status } = await testClient.post('/register', {
				email: 'noname@example.com',
				password: 'Test123!@#$',
				name: '', // Empty name
			})
			expect(status).toBe(422)
		})

		it('should reject registration with missing fields', async () => {
			const { status } = await testClient.post('/register', {
				email: 'incomplete@example.com',
				// Missing password and name
			})
			expect(status).toBe(422)
		})
	})

	describe('POST /auth/login', () => {
		it('should login with valid credentials', async () => {
			const { status, headers } = await testClient.post('/login', {
				email: testUser.email,
				password: testUser.password,
			})

			expect(status).toBe(200)
			expect(headers.get('set-cookie')).toBeDefined()
		})

		it('should not login with invalid credentials', async () => {
			const { status } = await testClient.post('/login', {
				email: testUser.email,
				password: 'wrongpassword',
			})

			expect(status).toBe(401)
		})
	})

	describe('POST /auth/forgot-password', () => {
		it('should send password reset email for existing user', async () => {
			const { status } = await testClient.post('/forgot-password', {
				email: testUser.email,
			})

			expect(status).toBe(200)
		})

		it('should not reveal if email exists', async () => {
			const { status } = await testClient.post('/forgot-password', {
				email: 'nonexistent@example.com',
			})

			expect(status).toBe(200)
		})
	})

	describe('POST /auth/logout', () => {
		it('should logout user and clear session', async () => {
			const { headers: loginHeaders } = await testClient.post('/login', {
				email: testUser.email,
				password: testUser.password,
			})

			const cookies = loginHeaders.get('set-cookie') ?? ''
			const { status, headers } = await testClient.post('/logout', {}, cookies)

			expect(status).toBe(200)
			expect(headers.get('set-cookie')).toContain('sessionId=;')
		})
	})

	describe('GET /auth/user', () => {
		it('should return user data when authenticated', async () => {
			const { headers: loginHeaders } = await testClient.post('/login', {
				email: testUser.email,
				password: testUser.password,
			})

			const cookies = loginHeaders.get('set-cookie') ?? ''
			const { status, data } = await testClient.get<{
				email: string
				name: string
				id: string
			}>('/user', cookies)

			expect(status).toBe(200)
			expect(data.email).toBe(testUser.email)
			expect(data.name).toBe(testUser.name)
			expect(data.id).toBeString()
		})

		it('should return 401 when not authenticated', async () => {
			const { status } = await testClient.get('/user')
			expect(status).toBe(401)
		})
	})

	describe('POST /auth/verify-email', () => {
		it('should verify email with valid token', async () => {
			// First register a user (unverified)
			const unverifiedUser = {
				email: 'test2@example.com',
				password: 'Test123!@#$',
				name: 'Test User 2',
			}
			await testClient.post('/register', unverifiedUser)

			// Get the user and verification token from database
			const [user] = await db
				.select()
				.from(users)
				.where(eq(users.email, unverifiedUser.email))
			const [token] = await db
				.select()
				.from(emailVerificationTokens)
				.where(eq(emailVerificationTokens.userId, user.id))

			const { status } = await testClient.post('/verify-email', {
				token: token.token,
				email: unverifiedUser.email,
			})

			expect(status).toBe(200)

			// Verify the user is now verified in database
			const [verifiedUser] = await db
				.select()
				.from(users)
				.where(eq(users.email, unverifiedUser.email))
			expect(verifiedUser.isVerified).toBe(true)

			// Verify the token was deleted
			const [deletedToken] = await db
				.select()
				.from(emailVerificationTokens)
				.where(eq(emailVerificationTokens.token, token.token))
			expect(deletedToken).toBeUndefined()
		})

		it('should not verify email with invalid token', async () => {
			const { status } = await testClient.post('/verify-email', {
				token: 'invalid-token',
				email: testUser.email,
			})

			expect(status).toBe(400)
		})

		it('should not verify email with expired token', async () => {
			// Create an expired token manually
			const [user] = await db.select().from(users).where(eq(users.email, testUser.email))
			const expiredToken = 'expired-token-123'
			const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago

			await db.insert(emailVerificationTokens).values({
				token: expiredToken,
				userId: user.id,
				expiresAt: expiredDate,
			})

			const { status } = await testClient.post('/verify-email', {
				token: expiredToken,
				email: testUser.email,
			})

			expect(status).toBe(400)
		})
	})

	describe('POST /auth/reset-password', () => {
		it('should reset password with valid token', async () => {
			// First request password reset for verified user
			await testClient.post('/forgot-password', {
				email: testUser.email,
			})

			// Get the password reset token from database
			const [user] = await db.select().from(users).where(eq(users.email, testUser.email))
			const [token] = await db
				.select()
				.from(passwordResetTokens)
				.where(eq(passwordResetTokens.userId, user.id))

			const newPassword = 'NewPassword123!@#'
			const { status } = await testClient.post('/reset-password', {
				token: token.token,
				email: testUser.email,
				password: newPassword,
			})

			expect(status).toBe(200)

			// Verify password was changed by trying to login with new password
			const { status: loginStatus } = await testClient.post('/login', {
				email: testUser.email,
				password: newPassword,
			})
			expect(loginStatus).toBe(200)

			// Verify the token was deleted
			const [deletedToken] = await db
				.select()
				.from(passwordResetTokens)
				.where(eq(passwordResetTokens.token, token.token))
			expect(deletedToken).toBeUndefined()
		})

		it('should not reset password with invalid token', async () => {
			const { status } = await testClient.post('/reset-password', {
				token: 'invalid-token',
				email: testUser.email,
				password: 'NewPassword123!@#',
			})

			expect(status).toBe(400)
		})

		it('should not reset password with expired token', async () => {
			// Create an expired token manually
			const [user] = await db.select().from(users).where(eq(users.email, testUser.email))
			const expiredToken = 'expired-reset-token-123'
			const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago

			await db.insert(passwordResetTokens).values({
				token: expiredToken,
				userId: user.id,
				expiresAt: expiredDate,
			})

			const { status } = await testClient.post('/reset-password', {
				token: expiredToken,
				email: testUser.email,
				password: 'NewPassword123!@#',
			})

			expect(status).toBe(400)
		})

		it('should not reset password with mismatched email', async () => {
			// Create a valid token for testUser
			const [user] = await db.select().from(users).where(eq(users.email, testUser.email))
			const validToken = 'valid-token-123'
			const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day from now

			await db.insert(passwordResetTokens).values({
				token: validToken,
				userId: user.id,
				expiresAt: futureDate,
			})

			// Try to reset with different email
			const { status } = await testClient.post('/reset-password', {
				token: validToken,
				email: 'different@example.com',
				password: 'NewPassword123!@#',
			})

			expect(status).toBe(400)
		})
	})
})
