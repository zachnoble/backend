import { z } from 'zod'

const login = z.object({
	email: z.string().email('Email is invalid'),
	password: z.string().min(1, 'Please enter your password'),
})

const register = z.object({
	email: z.string().email('Email is invalid'),
	name: z.string().min(1, 'Please enter a name'),
	password: z.string().min(10, 'Password must be at least 10 characters'),
})

export const schemas = {
	login,
	register,
}
