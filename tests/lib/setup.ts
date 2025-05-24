import { afterAll, beforeAll } from 'bun:test'
import { sql } from 'drizzle-orm'
import { db } from '~/db'
import { env } from '~/lib/env'

async function cleanDatabase() {
	if (env.NODE_ENV === 'test') {
		await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE`)
		await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`)
		await db.execute(sql`CREATE SCHEMA public`)
	}
}

beforeAll(async () => {
	await cleanDatabase()
	await Bun.spawn(['bun', 'run', 'migrate']).exited
})

afterAll(async () => {
	await cleanDatabase()
})
