import { z } from 'zod'
import { env } from '~/lib/env'

const recaptchaApiUrl =
	'https://recaptchaenterprise.googleapis.com/v1/projects/bun-recaptcha-test/assessments'

const recaptchaResponseSchema = z.object({
	tokenProperties: z.object({
		valid: z.boolean(),
		hostname: z.string(),
		action: z.string().optional(),
		createTime: z.string(),
	}),
	riskAnalysis: z.object({
		score: z.number(),
		reasons: z.array(z.string()).optional(),
	}),
})

const errorMessage = 'Suspicious activity detected. Please try again.'

export async function verifyRecaptchaToken(token?: string) {
	if (env.NODE_ENV !== 'production') return true

	const url = `${recaptchaApiUrl}?key=${env.GCP_RECAPTCHA_API_KEY}`

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			event: {
				token,
				siteKey: env.GCP_RECAPTCHA_SITE_KEY,
			},
		}),
	})

	if (!response.ok) {
		throw new Error(errorMessage)
	}

	const data = await response.json()
	const validatedData = recaptchaResponseSchema.parse(data)

	const isValid = validatedData.tokenProperties.valid
	const score = validatedData.riskAnalysis.score
	const pass = isValid && score >= 0.5

	if (!pass) {
		throw new Error(errorMessage)
	}
}
