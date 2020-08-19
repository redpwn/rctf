interface FetcherRequest {
  path: string
  method: string
  authToken?: string | null
  body?: unknown
}

interface FetcherResponse {
  kind: string
  message: string
  data: unknown
}

export const fetcher: (request: FetcherRequest) => Promise<FetcherResponse> = async ({ path, method, authToken, body }) => {
  let responseBody: FetcherResponse
  if (authToken === null) {
    throw new Error('attempted to request authenticated route without token')
  }
  const headers = new Headers()
  if (body !== undefined) {
    headers.set('content-type', 'application/json')
  }
  if (authToken !== undefined) {
    headers.set('authorization', `Bearer ${authToken}`)
  }
  try {
    const res = await fetch(`/api/v1/${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    })
    responseBody = await res.json() as FetcherResponse
  } catch {
    responseBody = {
      kind: 'errorNetwork',
      message: 'A network error occurred.',
      data: null
    }
  }
  return responseBody
}

export const uri = (parts: TemplateStringsArray, ...rest: string[]): string => parts
  .map((part, i) => part + (i < rest.length ? encodeURIComponent(rest[i]) : ''))
  .join('')
