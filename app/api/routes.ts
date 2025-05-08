import { Hono } from 'hono'
import { auth } from './auth/routes'
import { health } from './health/routes'

export const routes = new Hono().route('/health', health).route('/auth', auth)
