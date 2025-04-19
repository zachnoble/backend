import { Hono } from 'hono'
import { hono as auth } from './auth/routes'
import { hono as health } from './health/routes'

export const routes = new Hono().route('/health', health).route('/auth', auth)
