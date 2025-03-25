import type { Context } from 'hono'

export const success = (c: Context) => c.text('Success')
