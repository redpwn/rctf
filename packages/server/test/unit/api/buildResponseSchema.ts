import {
  optimizeSchema,
  kIsRawJson,
} from '../../../src/api/buildResponseSchema'

// eslint-disable-next-line @typescript-eslint/ban-types
function clone<T extends object>(val: T): T {
  return JSON.parse(JSON.stringify(val)) as T
}

function makeStandardResponse(
  kind: string,
  message: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  data?: object
): {
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
} {
  const ret: ReturnType<typeof makeStandardResponse> = {
    type: 'object',
    properties: {
      kind: {
        type: 'string',
        const: kind,
      },
      message: {
        type: 'string',
        const: message,
      },
    },
    requiredProperties: ['kind', 'message'],
    additionalProperties: false,
  }
  if (data !== undefined) {
    ret.properties.data = data
    ret.requiredProperties.push('data')
  }
  return ret
}

describe('optimizeSchema', () => {
  const testUnoptimizedSchema = {
    200: {
      oneOf: [
        makeStandardResponse('goodLogin', 'The login was successful.', {
          type: 'object',
          properties: { authToken: { type: 'string' } },
          required: ['authToken'],
          additionalProperties: false,
        }),
      ],
    },
    201: {
      oneOf: [
        {
          type: 'object',
          properties: {
            standings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  pos: { type: 'integer' },
                  team: { type: 'string' },
                  score: { type: 'number' },
                },
                required: ['pos', 'team', 'score'],
                additionalProperties: false,
              },
            },
          },
          required: ['standings'],
        },
      ],
      [kIsRawJson]: true as const,
    },
    202: {
      oneOf: [
        {
          type: 'object',
        },
        {
          type: 'array',
        },
      ],
      [kIsRawJson]: true as const,
    },
    400: {
      oneOf: [
        makeStandardResponse(
          'badTokenVerification',
          'The token provided is invalid.'
        ),
        makeStandardResponse(
          'badCtftimeToken',
          'The CTFtime token provided is invalid.'
        ),
      ],
    },
    401: {
      oneOf: [
        makeStandardResponse(
          'badTokenVerification',
          'The token provided is invalid.'
        ),
        makeStandardResponse('badRateLimit', 'You are trying this too fast.', {
          type: 'object',
          properties: {
            timeLeft: {
              type: 'number',
            },
          },
          requiredProperties: ['timeLeft'],
        }),
      ],
    },
    402: {
      oneOf: [
        makeStandardResponse('resA', 'messageA', {
          type: 'string',
        }),
        makeStandardResponse('resB', 'messageB', {
          type: 'number',
        }),
      ],
    },
    403: {
      oneOf: [
        makeStandardResponse('resA', 'messageA', {
          type: 'string',
        }),
        makeStandardResponse('resB', 'messageB', {
          type: 'number',
        }),
        makeStandardResponse('resC', 'messageC'),
      ],
    },
  }
  const origSchema = clone(testUnoptimizedSchema)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const optimizedSchema: any = optimizeSchema(testUnoptimizedSchema)

  /* eslint-disable @typescript-eslint/no-unsafe-member-access */

  test('single schema is hoisted', () => {
    expect(optimizedSchema[200]).toEqual(origSchema[200].oneOf[0])
  })

  test('single schema with raw JSON is hoisted', () => {
    expect(optimizedSchema[201]).toEqual(origSchema[201].oneOf[0])
  })

  test('multiple conflicting raw JSON schemas are deopted', () => {
    expect(optimizedSchema[202]).toBeUndefined()
  })

  test('standard format schemas without data are merged', () => {
    expect(optimizedSchema[400]).toMatchInlineSnapshot(`
      Object {
        "additionalProperties": false,
        "properties": Object {
          "kind": Object {
            "enum": Array [
              "badTokenVerification",
              "badCtftimeToken",
            ],
            "type": "string",
          },
          "message": Object {
            "enum": Array [
              "The token provided is invalid.",
              "The CTFtime token provided is invalid.",
            ],
            "type": "string",
          },
        },
        "requiredProperties": Array [
          "kind",
          "message",
        ],
        "type": "object",
      }
    `)
  })

  describe('standard format schemas with asymmetric single defined data', () => {
    test('asymmetric data does not have data required', () => {
      expect(optimizedSchema[401].requiredProperties).not.toContain('data')
    })

    test('single data has data hoisted', () => {
      expect(optimizedSchema[401].properties.data).not.toHaveProperty('oneOf')
    })

    test('snapshot', () => {
      expect(optimizedSchema[401]).toMatchInlineSnapshot(`
        Object {
          "additionalProperties": false,
          "properties": Object {
            "data": Object {
              "properties": Object {
                "timeLeft": Object {
                  "type": "number",
                },
              },
              "requiredProperties": Array [
                "timeLeft",
              ],
              "type": "object",
            },
            "kind": Object {
              "enum": Array [
                "badTokenVerification",
                "badRateLimit",
              ],
              "type": "string",
            },
            "message": Object {
              "enum": Array [
                "The token provided is invalid.",
                "You are trying this too fast.",
              ],
              "type": "string",
            },
          },
          "requiredProperties": Array [
            "kind",
            "message",
          ],
          "type": "object",
        }
      `)
    })
  })

  describe('standard format schemas with symmetric defined data', () => {
    test('symmetric data has data required', () => {
      expect(optimizedSchema[402].requiredProperties).toContain('data')
    })

    test('snapshot', () => {
      expect(optimizedSchema[402]).toMatchInlineSnapshot(`
        Object {
          "additionalProperties": false,
          "properties": Object {
            "data": Object {
              "oneOf": Array [
                Object {
                  "type": "string",
                },
                Object {
                  "type": "number",
                },
              ],
            },
            "kind": Object {
              "enum": Array [
                "resA",
                "resB",
              ],
              "type": "string",
            },
            "message": Object {
              "enum": Array [
                "messageA",
                "messageB",
              ],
              "type": "string",
            },
          },
          "requiredProperties": Array [
            "kind",
            "message",
            "data",
          ],
          "type": "object",
        }
      `)
    })
  })

  describe('standard format schemas with asymmetric multiple defined data', () => {
    test('asymmetric data does not have data required', () => {
      expect(optimizedSchema[403].requiredProperties).not.toContain('data')
    })

    test('no undefined schemas', () => {
      expect(optimizedSchema[403].properties.data.oneOf).not.toContain(
        undefined
      )
    })

    test('snapshot', () => {
      expect(optimizedSchema[403]).toMatchInlineSnapshot(`
        Object {
          "additionalProperties": false,
          "properties": Object {
            "data": Object {
              "oneOf": Array [
                Object {
                  "type": "string",
                },
                Object {
                  "type": "number",
                },
              ],
            },
            "kind": Object {
              "enum": Array [
                "resA",
                "resB",
                "resC",
              ],
              "type": "string",
            },
            "message": Object {
              "enum": Array [
                "messageA",
                "messageB",
                "messageC",
              ],
              "type": "string",
            },
          },
          "requiredProperties": Array [
            "kind",
            "message",
          ],
          "type": "object",
        }
      `)
    })
  })

  /* eslint-enable @typescript-eslint/no-unsafe-member-access */
})
