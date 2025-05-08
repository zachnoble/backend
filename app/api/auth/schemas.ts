import { z } from 'zod'

const email = z.string().email('Invalid email address')

const login = z.object({
	email,
	password: z.string().min(1, 'Password is required'),
})

const register = z.object({
	email,
	name: z.string().min(2, 'Name is required'),
	password: z.string().min(10, 'Password must be at least 10 characters long'),
})

export const schemas = {
	login,
	register,
}
