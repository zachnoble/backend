import { env } from '~/lib/env'
import { resend } from '~/lib/resend'

/**
 * Send a verification email to a user with a link to verify their account.
 * The link is valid for 24 hours.
 */
export async function sendVerificationEmail(email: string, token: string) {
	const verificationUrl = `${env.ORIGIN}/verify-email?token=${token}&email=${email}`

	await resend.emails.send({
		from: env.EMAIL_FROM,
		to: email,
		subject: 'Verify Your Email Address',
		html: `
		<!DOCTYPE html>
		<html>
		<head>
		  <meta charset="UTF-8">
		  <title>Verify Your Email</title>
		</head>
		<body style="margin:0; padding:0; background-color:#f4f4f4;">
		  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 20px 0;">
			<tr>
			  <td align="center">
				<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; padding:40px; font-family:Arial, sans-serif;">
				  <tr>
					<td align="center" style="padding-bottom:20px;">
					  <h1 style="color:#333333; margin:0;">Welcome!</h1>
					</td>
				  </tr>
				  <tr>
					<td style="color:#555555; font-size:16px; line-height:1.5; padding-bottom:30px;">
					  <p style="margin:0;">Thank you for signing up. Please verify your email address by clicking the button below:</p>
					</td>
				  </tr>
				  <tr>
					<td align="center" style="padding-bottom:30px;">
					  <a href="${verificationUrl}" style="background-color:#007BFF; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:4px; display:inline-block;">Verify Email</a>
					</td>
				  </tr>
				  <tr>
					<td style="color:#999999; font-size:12px; text-align:center;">
					  <p style="margin:0;">This link will expire in 24 hours.</p>
					</td>
				  </tr>
				</table>
			  </td>
			</tr>
		  </table>
		</body>
		</html>
	  `,
	})
}
