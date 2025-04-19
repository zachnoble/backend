import { cors as honoCors } from 'hono/cors'
import { config } from '~/config'

export const cors = honoCors({
	origin: config.ORIGIN,
	allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
	credentials: true,
})
