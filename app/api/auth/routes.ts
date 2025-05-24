import { Hono } from 'hono'
import { verifyRecaptchaToken } from '~/lib/recaptcha'
import { success } from '~/lib/responses'
import { authenticate } from '~/middleware/auth'
import { validate } from '~/middleware/validate'
import { sendVerificationEmail } from './emails/account-verification'
import { sendPasswordResetEmail } from './emails/password-reset'
import { schemas } from './schemas'
import { login, logout, register, resetPassword, verifyEmail } from './services'
import {
	deleteSessionCookie,
	generatePasswordResetToken,
	generateVerificationToken,
	getSessionIdFromCookie,
	setSessionCookie,
} from './utils'

export const auth = new Hono()

auth.post('/login', validate('json', schemas.login), async (c) => {
	const body = c.req.valid('json')

	// Require valid reCAPTCHA token
	await verifyRecaptchaToken(body.recaptchaToken)

	// Login the user and include the session id in the set cookie header.
	const sessionId = await login(body)
	await setSessionCookie(c, sessionId)

	return success(c)
})

auth.post('/register', validate('json', schemas.register), async (c) => {
	const body = c.req.valid('json')

	// Require valid reCAPTCHA token
	await verifyRecaptchaToken(body.recaptchaToken)

	// Register the user and send a verification email.
	const user = await register(body)
	const token = await generateVerificationToken(user.id)
	await sendVerificationEmail(user.email, token)

	return success(c)
})

auth.post('/verify-email', validate('json', schemas.verifyEmail), async (c) => {
	const { token, email } = c.req.valid('json')

	await verifyEmail({ token, email })

	return success(c)
})

auth.post('/forgot-password', validate('json', schemas.forgotPassword), async (c) => {
	const { email, recaptchaToken } = c.req.valid('json')

	// Require valid reCAPTCHA token
	await verifyRecaptchaToken(recaptchaToken)

	// Generate a password reset token and send an email to the user.
	const token = await generatePasswordResetToken(email)
	if (token) await sendPasswordResetEmail(email, token)

	return success(c)
})

auth.post('/reset-password', validate('json', schemas.resetPassword), async (c) => {
	const { token, email, password } = c.req.valid('json')

	await resetPassword({ token, email, password })

	return success(c)
})

auth.post('/logout', authenticate, async (c) => {
	const sessionId = await getSessionIdFromCookie(c)

	// Delete the session id if it exists.
	if (sessionId) {
		deleteSessionCookie(c)
		await logout(sessionId)
	}

	// Return 200 even if the session id does not exist.
	return success(c)
})

auth.get('/user', authenticate, (c) => c.json(c.user))
