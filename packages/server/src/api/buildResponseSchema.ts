import { Route as ApiRoute } from '@rctf/api-types'
import { Responses } from '@rctf/api-types/responses'
import * as _responseObjects from '@rctf/api-types/responses'
import { FastifySchema } from 'fastify'

const responseObjects = _responseObjects as Responses

// TYPESCRIPT OBJECT UTILITIES

// eslint-disable-next-line @typescript-eslint/ban-types
type ExcludeFromProperties<T extends object, U> = {
  [K in keyof T]: Exclude<T[K], U>
}

/**
 * Mutates obj to remove all properties which are `false` exactly
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function removeFalseProperties<T extends object>(
  obj: T
): ExcludeFromProperties<T, false> {
  const ret = obj as ExcludeFromProperties<T, false>
  for (const key in obj) {
    const currProp = obj[key]
    // TypeScript incorrectly concludes currProp must be `false`
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment,@typescript-eslint/prefer-ts-expect-error
    // @ts-ignore
    if (currProp === false) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete ret[key]
    }
  }

  return ret
}

// MAIN MODULE CODE

export const kIsRawJson = Symbol('isRawJson')

type UnoptimizedSchema = FastifySchema['response'] & {
  [key: number]: {
    // eslint-disable-next-line @typescript-eslint/ban-types
    oneOf: object[]
    [kIsRawJson]?: true
  }
}

interface StandardResponseSchema {
  type: 'object'
  properties: {
    kind: {
      type: 'string'
      const: string
    }
    message: {
      type: 'string'
      const: string
    }
    // eslint-disable-next-line @typescript-eslint/ban-types
    data?: object
  }
  requiredProperties: ('kind' | 'message' | 'data')[]
  additionalProperties: false
}

export function buildUnoptimizedSchema(
  kinds: (keyof Responses)[]
): UnoptimizedSchema {
  const responseSchema: {
    [K in keyof UnoptimizedSchema]: UnoptimizedSchema[K] | false
  } = {}
  for (const kind of kinds) {
    const responseObj = responseObjects[kind]
    if ('rawContentType' in responseObj) {
      // Ensure no response schema for this code, because we aren't sending
      // JSON
      responseSchema[responseObj.status] = false
      continue
    }

    if (!(responseObj.status in responseSchema)) {
      responseSchema[responseObj.status] = {
        oneOf: [],
      }
    }

    const currSchema = responseSchema[responseObj.status]
    if (currSchema !== false) {
      if ('message' in responseObj) {
        const thisSchema: StandardResponseSchema = {
          type: 'object',
          properties: {
            kind: {
              type: 'string',
              const: kind,
            },
            message: {
              type: 'string',
              const: responseObj.message,
            },
            // eslint-disable-next-line @typescript-eslint/ban-types
          },
          requiredProperties: ['kind', 'message'],
          additionalProperties: false,
        }
        if ('data' in responseObj && responseObj.data !== undefined) {
          thisSchema.properties.data = responseObj.data
          thisSchema.requiredProperties.push('data')
        }
        currSchema.oneOf.push(thisSchema)
      }
      // Keep the undefined check anyways for safety
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if ('rawJson' in responseObj && responseObj.rawJson !== undefined) {
        currSchema.oneOf.push(responseObj.rawJson)
        currSchema[kIsRawJson] = true
      }
    }
  }

  return removeFalseProperties(responseSchema)
}

/**
 * Modify schema in-place for use with fast-json-stringify
 *
 * Technically this function is not just optimization, since it performs
 * transforms necessary for fast-json-stringify to stringify correctly at all
 */
export function optimizeSchema(
  schema: UnoptimizedSchema
): FastifySchema['response'] {
  for (const key in schema) {
    const currSchema = schema[key]
    if (currSchema.oneOf.length === 1) {
      // There's only one oneOf, so lift the subschema to the root
      // I'm too lazy to type this better
      ;(schema[key] as unknown) = currSchema.oneOf[0]
    } else {
      // fast-json-schema doesn't support `oneOf` at top level; we will need to
      // either hoist some properties to push the `oneOf` down to a property,
      // or deoptimize and delete the schema
      if (currSchema[kIsRawJson]) {
        // Pulling common properties of arbitrary schemas is to complex, so
        // deoptimize instead
        // TODO: look into optimizing here as well
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete schema[key]
      } else {
        // All subschemas follow the standard `kind`/`message` format; lift the
        // properties to the root and rebuild the `oneOf` at `$.data` only
        const oneOfs = currSchema.oneOf as StandardResponseSchema[]
        const kinds = oneOfs.map(subschema => subschema.properties.kind.const)
        const messages = oneOfs.map(
          subschema => subschema.properties.message.const
        )
        const dataSchemas = oneOfs.map(subschema => subschema.properties.data)

        const newSchema: Omit<StandardResponseSchema, 'properties'> & {
          properties: Omit<
            StandardResponseSchema['properties'],
            'kind' | 'message'
          > & {
            kind: {
              type: 'string'
              enum: string[]
            }
            message: {
              type: 'string'
              enum: string[]
            }
          }
        } = {
          type: 'object',
          properties: {
            kind: {
              type: 'string',
              enum: kinds,
            },
            message: {
              type: 'string',
              enum: messages,
            },
          },
          requiredProperties: ['kind', 'message'],
          additionalProperties: false,
        }

        const nonNullDataSchemas = dataSchemas.filter(s => s)
        if (nonNullDataSchemas.length > 0) {
          if (nonNullDataSchemas.length === 1) {
            // Hoist if there is only one
            newSchema.properties.data = nonNullDataSchemas[0]
          } else {
            newSchema.properties.data = {
              oneOf: nonNullDataSchemas,
            }
          }

          // if there are any dataSchemas which are undefined, then there
          // exists responses without `data`, therefore we cannot make it
          // required
          if (dataSchemas.filter(s => s === undefined).length === 0) {
            newSchema.requiredProperties.push('data')
          }
        }

        // I'm too lazy to type this better
        ;(schema[key] as unknown) = newSchema
      }
    }
  }

  return schema
}

export function buildResponseSchema<Route extends ApiRoute>(
  route: Route
): FastifySchema['response'] {
  return optimizeSchema(buildUnoptimizedSchema(route.responses))
}

export default buildResponseSchema
