import {
  Route as ApiRoute,
  GetRouteBodyType,
  GetRouteQSType,
  GetRouteParamsType,
  GetRouteResponseType,
} from '@rctf/api-types'
import { GetRouteResponseKinds } from '@rctf/api-types/routes'
import {
  Responses,
  ResponsePayloads,
  ResponseKind,
  GetResponsePayloadDataType,
} from '@rctf/api-types/responses'
import * as _responseObjects from '@rctf/api-types/responses'
import {
  RouteOptions,
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  FastifySchema,
} from 'fastify'
import { RouteGenericInterface as FastifyRouteGenericInterface } from 'fastify/types/route'
// TODO: try to avoid using these Fastify internals
import {
  RawServerDefault as FastifyRawServerDefault,
  RawRequestDefaultExpression as FastifyRawRequestDefaultExpression,
  RawReplyDefaultExpression as FastifyRawReplyDefaultExpression,
} from 'fastify/types/utils'

import buildResponseSchema from './buildResponseSchema'

import { getData as tokenGetData, tokenKinds } from '../auth/token'
import { User, getUserById } from '../database/users'

const responseObjects = _responseObjects as Responses

// FIXME: consolidate with duplicate in database/util
type ArrayValue<Arr> = Arr extends (infer Val)[] ? Val : Arr

type GetFastifyRouteGenericForRoute<
  Route extends ApiRoute
> = FastifyRouteGenericInterface & {
  Body: GetRouteBodyType<Route>
  Querystring: GetRouteQSType<Route>
  Params: GetRouteParamsType<Route>
  Reply: GetRouteResponseType<Route>
}

// https://github.com/fastify/fastify/blob/v3.7.0/types/route.d.ts#L127
// Not general, only for our specific use case
type GetFastifyRouteHandlerMethod<
  RouteGeneric extends FastifyRouteGenericInterface
> = (
  this: FastifyInstance,
  request: FastifyRequest<RouteGeneric>,
  // No generics for FasifyReply because we expect to use the return value to
  // create responses - likewise the promise must resolve to a value (not void)
  reply: FastifyReply
) => Promise<RouteGeneric['Reply']>

interface ResponseFactoryReturn<ResponseKind extends keyof Responses> {
  status: number
  rawContentType?: string
  payload: ResponsePayloads[ResponseKind]
}

// Factory function to construct a response object from the payload of the route
// (i.e. automatically wraps into kind/message/data when appropriate)
type ResponseFactory<
  ResponseKind extends keyof Responses
> = GetResponsePayloadDataType<Responses[ResponseKind]> extends never
  ? () => ResponseFactoryReturn<ResponseKind>
  : (
      data: GetResponsePayloadDataType<Responses[ResponseKind]>
    ) => ResponseFactoryReturn<ResponseKind>

// Factories for all allowable responses for a route handler
export type HandlerResponseFactories<ResponseKinds extends keyof Responses> = {
  [Kind in ResponseKinds]: ResponseFactory<Kind>
}

function makeResponseFactory<Kind extends keyof Responses>(
  kind: Kind
): ResponseFactory<Kind> {
  const responseObj: ResponseKind = responseObjects[kind]

  const topLevel: Omit<ResponseFactoryReturn<Kind>, 'payload'> = {
    status: responseObj.status,
  }
  if ('rawContentType' in responseObj) {
    topLevel.rawContentType = responseObj.rawContentType
  }

  // This logic must be manually type-checked since I can't figure out how to
  // make TypeScript not error on converting the types. Many of the invariants
  // are not expressed in the type system, and TypeScript has a hard time
  // inferring from the ifs anyways.
  if ('data' in responseObj && 'message' in responseObj) {
    return ((data: GetResponsePayloadDataType<Responses[Kind]>) => ({
      ...topLevel,
      payload: ({
        kind,
        message: responseObj.message,
        data,
      } as unknown) as ReturnType<ResponseFactory<Kind>>['payload'],
    })) as ResponseFactory<Kind>
  } else if ('message' in responseObj) {
    return (() => ({
      ...topLevel,
      payload: ({
        kind,
        message: responseObj.message,
      } as unknown) as ReturnType<ResponseFactory<Kind>>['payload'],
    })) as ResponseFactory<Kind>
  } else {
    // Either `rawJson` or `rawContentType` payload - both should be passed
    // through unchanged
    return ((data: GetResponsePayloadDataType<Responses[Kind]>) => ({
      ...topLevel,
      payload: (data as unknown) as ReturnType<
        ResponseFactory<Kind>
      >['payload'],
    })) as ResponseFactory<Kind>
  }
}

export function makeResponseFactories<ResponseKinds extends keyof Responses>(
  responseKinds: ResponseKinds[]
): HandlerResponseFactories<ResponseKinds> {
  const factories = {} as ReturnType<typeof makeResponseFactories>
  for (const kind of responseKinds) {
    ;(factories[kind] as ResponseFactory<typeof kind>) = makeResponseFactory(
      kind
    )
  }
  return factories
}

interface HandlerBaseArgs<Route extends ApiRoute> {
  req: FastifyRequest<GetFastifyRouteGenericForRoute<Route>>
  res: HandlerResponseFactories<ArrayValue<Route['responses']>>
}

export type HandlerArgs<Route extends ApiRoute> = HandlerBaseArgs<Route> &
  (Route['requireAuth'] extends true
    ? {
        user: User
      }
    : unknown)

// Type for handler args object with all possible properties
type InternalFullHandlerArgs<Route extends ApiRoute> = HandlerBaseArgs<
  Route
> & { user?: User }

export type HandlerType<Route extends ApiRoute> = (
  args: HandlerArgs<Route>
) => Promise<ResponseFactoryReturn<GetRouteResponseKinds<Route>>>

export const processResponseFactoryReturn = <
  ResponseKind extends keyof Responses
>(
  result: ResponseFactoryReturn<ResponseKind>,
  reply: FastifyReply
): ResponsePayloads[ResponseKind] => {
  void reply.code(result.status)
  if (result.rawContentType !== undefined) {
    void reply.type(result.rawContentType)
  }

  return result.payload
}

// Manually type-checked cast; even though the return types *should* be
// identical, it seems that Typescript replaces `GetRouteResponseKinds<Route>`
// with (the equivalent of) `indexof Responses` when indexing into
// `ResponsePayloads`, breaking type compatibility.
// Note: casting the function directly is technically less type-safe, as we are
// casting the whole function instead of just one argument. However, this
// avoids a call since `processHandlerResult` is the same function as
// `processResponseFactoryReturn`.
const processHandlerResult = processResponseFactoryReturn as <
  Route extends ApiRoute
>(
  result: ResponseFactoryReturn<GetRouteResponseKinds<Route>>,
  reply: FastifyReply
) => GetRouteResponseType<Route>

// NOT-TYPE-SAFE function for use when it is known through API specification
// invariants that a certain response kind is guaranteed to be valid for a
// route
// Note: casting the function directly is technically less type-safe, as we are
// casting the whole function instead of just one argument. However, this
// avoids a call since `unsafeProcessHandlerResult` is the same function as
// `processHandlerResult`.
const unsafeProcessHandlerResult = processHandlerResult as <
  Route extends ApiRoute
>(
  result: ResponseFactoryReturn<keyof Responses>,
  reply: FastifyReply
) => GetRouteResponseType<Route>

function makeWrappedHandler<Route extends ApiRoute>(
  route: Route,
  handler: HandlerType<Route>
): GetFastifyRouteHandlerMethod<GetFastifyRouteGenericForRoute<Route>> {
  const responseFactories = makeResponseFactories(route.responses)

  return async (
    req,
    reply
  ): ReturnType<
    GetFastifyRouteHandlerMethod<GetFastifyRouteGenericForRoute<Route>>
  > => {
    const handlerArgs: InternalFullHandlerArgs<Route> = {
      req,
      res: responseFactories,
    }
    if (route.requireAuth) {
      const authHeader = req.headers.authorization
      if (authHeader === undefined || !authHeader.startsWith('Bearer ')) {
        return unsafeProcessHandlerResult<Route>(
          responseFactories.badToken(),
          reply
        )
      }
      const uuid = await tokenGetData(
        tokenKinds.auth,
        authHeader.slice('Bearer '.length)
      )
      if (uuid === null) {
        return unsafeProcessHandlerResult<Route>(
          responseFactories.badToken(),
          reply
        )
      }

      const user = await getUserById({
        id: uuid,
      })
      if (!user) {
        return unsafeProcessHandlerResult<Route>(
          responseFactories.badToken(),
          reply
        )
      }
      req.log = req.log.child({ user })
      req.log.info('user authenticated')

      handlerArgs.user = user
    }

    if (route.perms !== undefined) {
      // handlerArgs.user is guaranteed to exist; the route spec schema
      // verifies that requireAuth must be true if perms is set
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if ((handlerArgs.user!.perms & route.perms) !== route.perms) {
        return unsafeProcessHandlerResult<Route>(
          responseFactories.badPerms(),
          reply
        )
      }
    }

    return processHandlerResult<Route>(
      await handler(handlerArgs as HandlerArgs<Route>),
      reply
    )
  }
}

export function makeFastifyRoute<Route extends ApiRoute>(
  route: Route,
  handler: HandlerType<Route>,
  extraOptions?: Omit<RouteOptions, 'schema' | 'handler' | 'method' | 'url'>
): RouteOptions<
  FastifyRawServerDefault,
  FastifyRawRequestDefaultExpression<FastifyRawServerDefault>,
  FastifyRawReplyDefaultExpression<FastifyRawServerDefault>,
  GetFastifyRouteGenericForRoute<Route>
> {
  const wrappedHandler = makeWrappedHandler(route, handler)

  const fastifySchema: FastifySchema = {
    ...route.schema,
    response: buildResponseSchema(route),
  }

  const fastifyRoute = {
    ...extraOptions,
    method: route.method,
    schema: fastifySchema,
    url: route.path,
    handler: wrappedHandler,
  }

  return fastifyRoute
}
