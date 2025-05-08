import readline from 'node:readline'
import { setTimeout } from 'node:timers/promises'
import { spawn } from 'bun'
import { env } from '~/lib/env'

const { GCP_INSTANCE_CONNECTION_NAME, DB_HOST, DB_PORT } = env

if (!GCP_INSTANCE_CONNECTION_NAME) {
	console.error('GCP_INSTANCE_CONNECTION_NAME is not set')
	process.exit(1)
}

const confirmation = await new Promise<string>((resolve) => {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})
	rl.question(
		`Type 'migrate' to confirm migration for connection ${GCP_INSTANCE_CONNECTION_NAME}: `,
		(answer) => {
			rl.close()
			resolve(answer)
		},
	)
})

if (confirmation !== 'migrate') {
	console.log('Operation cancelled.')
	process.exit(0)
}

const proxy = spawn(
	[
		'cloud-sql-proxy',
		'--address',
		DB_HOST,
		'--port',
		DB_PORT.toString(),
		GCP_INSTANCE_CONNECTION_NAME,
	],
	{
		stderr: 'inherit',
		stdout: 'inherit',
		stdin: 'ignore',
	},
)

console.log('Starting Cloud SQL Proxy...')
await setTimeout(3000)

console.log('Running migrations...')
const migrate = spawn(['bun', 'run', 'migrate'], {
	stderr: 'inherit',
	stdout: 'inherit',
	stdin: 'ignore',
})

const result = await migrate.exited
if (result !== 0) {
	console.error('Migration failed.')
	proxy.kill()
	process.exit(1)
}

console.log('Migration completed successfully.')
proxy.kill()
