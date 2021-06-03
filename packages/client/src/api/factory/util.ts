import type {
  GetRouteParamsType,
  GetRouteQSType,
  Route as RouteGeneric,
} from '@rctf/api-types'

export const makeQuery = (params: Record<string, string | number>): string => {
  const query = new URLSearchParams(
    Object.entries(params)
      .map(([key, value]) => [key, `${value}`])
      .sort((a, b) => a[0].localeCompare(b[0]))
  )
  return query.toString()
}

export interface PathBuilderArgs<Route extends RouteGeneric> {
  qs: GetRouteQSType<Route>
  params: GetRouteParamsType<Route>
}

export type PathBuilder<Route extends RouteGeneric> = (
  arg: PathBuilderArgs<Route>
) => string

export const makePathBuilder = <Route extends RouteGeneric>(
  route: Route
): PathBuilder<Route> => {
  const pathParts = route.path.split(/(?<=\/)(:\w+)/g)
  return ({ params, qs }) =>
    pathParts
      .map(part =>
        part.startsWith(':')
          ? params[part.slice(1) as keyof typeof params]
          : part
      )
      .join('') +
    '?' +
    // TODO: try to avoid this cast, or enforce elsewhere?
    makeQuery(qs as Record<string, string | number>)
}
