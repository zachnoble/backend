import { z } from 'zod'

export const loginRequest = z.object({
	email: z.string().email('Email is invalid'),
	password: z.string().min(1, 'Please enter your password'),
})

export const registerRequest = z.object({
	email: z.string().email('Email is invalid'),
	name: z.string().min(1, 'Please enter a name'),
	password: z.string().min(10, 'Password must be at least 10 characters'),
})
