import { app } from '~/index'

type RequestOptions = {
	method?: string
	headers?: Record<string, string>
	body?: string
	cookies?: string
}

type TestClientConfig = {
	prefix?: string
}

type Response<T = unknown> = {
	status: number
	headers: Headers
	data: T
}

async function makeRequest<T = unknown>(
	url: string,
	options: RequestOptions = {},
): Promise<Response<T>> {
	const defaultHeaders: Record<string, string> = {
		'Content-Type': 'application/json',
		...options.headers,
	}

	if (options.cookies) {
		defaultHeaders.Cookie = options.cookies
	}

	const response = await app.request(url, {
		method: options.method || 'GET',
		headers: defaultHeaders,
		body: options.body,
	})

	const contentType = response.headers.get('content-type')
	let data: T

	if (contentType?.includes('application/json')) {
		data = (await response.json()) as T
	} else {
		data = undefined as T
	}

	return {
		status: response.status,
		headers: response.headers,
		data,
	}
}

export function createTestClient(config: TestClientConfig = {}) {
	const { prefix = '' } = config

	async function post<T = unknown>(
		path: string,
		data: unknown,
		cookies?: string,
	): Promise<Response<T>> {
		const url = `${prefix}${path}`
		const requestData = data
		return makeRequest<T>(url, {
			method: 'POST',
			body: JSON.stringify(requestData),
			cookies,
		})
	}

	async function get<T = unknown>(path: string, cookies?: string): Promise<Response<T>> {
		const url = `${prefix}${path}`
		return makeRequest<T>(url, {
			method: 'GET',
			cookies,
		})
	}

	return {
		post,
		get,
	}
}

export const testClient = createTestClient()
