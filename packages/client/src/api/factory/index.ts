import useSWR, { SWRResponse } from 'swr'
import type {
  GetRouteResponseType,
  Route as RouteGeneric,
} from '@rctf/api-types'
import { useAuthToken } from '../../util/auth'
import { makePathBuilder, PathBuilderArgs } from './util'
import { useMemo } from 'react'

const swrFetcher = async <Route extends RouteGeneric>(
  uri: string,
  method: string,
  token?: string
): Promise<GetRouteResponseType<Route>> => {
  const headers = new Headers()
  if (token !== undefined) {
    headers.set('authorization', `Bearer ${token}`)
  }
  try {
    const res = await fetch(`/api/v1/${uri}`, {
      method,
    })
    return (await res.json()) as GetRouteResponseType<Route>
  } catch {
    // FIXME: use proper errors
    throw new Error('network error')
  }
}

// This function exists to codify / document the format of the cache key
// (function basically does nothing useful)
/**
 * Make SWR cache key / fetcher args for given arguments
 *
 * @param fullPath path of route, including query params but not /api prefix
 * @param method HTTP verb (capitalized)
 * @param authToken auth token
 * @returns the cache key
 */
const makeCacheKey = (
  fullPath: string,
  method: RouteGeneric['method'],
  authToken: string | undefined
): Parameters<typeof swrFetcher> => [fullPath, method, authToken]

type FetcherHook<Route extends RouteGeneric> = (
  arg: PathBuilderArgs<Route>
  // TODO: pin down error types?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => SWRResponse<GetRouteResponseType<Route>, any>

export const makeFetcherHook = <Route extends RouteGeneric>(
  route: Route
): FetcherHook<Route> => {
  const pathBuilder = makePathBuilder(route)
  const useRoute: FetcherHook<Route> = arg => {
    let authToken: string | undefined
    if (route.requireAuth) {
      // This condition is constant over the lifetime of this hook, so it is
      // safe to call hooks here
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const _authToken = useAuthToken()
      if (_authToken === null) {
        throw new Error('FIXME')
      }
      authToken = _authToken
    }
    // TODO: do we need to memoize?
    const path = useMemo(() => pathBuilder(arg), [arg])
    return useSWR<GetRouteResponseType<Route>>(
      makeCacheKey(path, route.method, authToken),
      swrFetcher
    )
  }
  return useRoute
}
