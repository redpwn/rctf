import {
  buildUnoptimizedSchema,
  optimizeSchema,
  kIsRawJson,
} from '../../../src/api/buildResponseSchema'
import { deepCopy as clone } from '../../../src/util/object'
import * as _responseObjects from '@rctf/api-types/responses'
import { Responses } from '@rctf/api-types/responses'

// Setup of test response kinds

declare module '@rctf/api-types/responses' {
  interface Responses {
    testNoDataA: ResponseKind
    testDataA: ResponseKind
    testRawJsonA: ResponseKind
    testRawContentTypeA: ResponseKind
    testRawContentTypeB: ResponseKind
  }
  interface ResponsePayloads {
    testNoDataA: never
    testDataA: never
    testRawJsonA: never
    testRawContentTypeA: never
    testRawContentTypeB: never
  }
}

const responseObjects = _responseObjects as Responses
responseObjects.testNoDataA = {
  status: 200,
  message: 'testNoDataAMessage',
}
responseObjects.testDataA = {
  status: 200,
  message: 'testDataAMessage',
  data: {
    type: 'object',
    properties: {
      a: {
        type: 'integer',
      },
    },
    required: ['a'],
  },
}
responseObjects.testRawJsonA = {
  status: 200,
  rawJson: {
    type: 'object',
    properties: {
      rawJsonA: {
        type: 'integer',
      },
    },
    required: ['rawJsonA'],
  },
}
responseObjects.testRawContentTypeA = {
  status: 200,
  rawContentType: 'text/plain',
}
responseObjects.testRawContentTypeB = {
  status: 201,
  rawContentType: 'text/plain',
}

// Begin tests

describe('buildUnoptimizedSchema', () => {
  test('rawContentType removes schema for status', () => {
    const schema = buildUnoptimizedSchema([
      'testDataA',
      'testRawJsonA',
      'testRawContentTypeA',
      'testNoDataA',
    ])
    expect(schema).not.toHaveProperty('200')
  })

  test('rawContentType does not modify other codes', () => {
    const schema = buildUnoptimizedSchema(['testDataA', 'testRawContentTypeB'])
    expect(schema).toHaveProperty('200')
    expect(schema).not.toHaveProperty('201')
  })

  test('no overrides snapshot', () => {
    expect(buildUnoptimizedSchema(['testNoDataA', 'testDataA', 'testRawJsonA']))
      .toMatchInlineSnapshot(`
      Object {
        "200": Object {
          "oneOf": Array [
            Object {
              "additionalProperties": false,
              "properties": Object {
                "kind": Object {
                  "const": "testNoDataA",
                  "type": "string",
                },
                "message": Object {
                  "const": "testNoDataAMessage",
                  "type": "string",
                },
              },
              "requiredProperties": Array [
                "kind",
                "message",
              ],
              "type": "object",
            },
            Object {
              "additionalProperties": false,
              "properties": Object {
                "data": Object {
                  "properties": Object {
                    "a": Object {
                      "type": "integer",
                    },
                  },
                  "required": Array [
                    "a",
                  ],
                  "type": "object",
                },
                "kind": Object {
                  "const": "testDataA",
                  "type": "string",
                },
                "message": Object {
                  "const": "testDataAMessage",
                  "type": "string",
                },
              },
              "requiredProperties": Array [
                "kind",
                "message",
                "data",
              ],
              "type": "object",
            },
            Object {
              "properties": Object {
                "rawJsonA": Object {
                  "type": "integer",
                },
              },
              "required": Array [
                "rawJsonA",
              ],
              "type": "object",
            },
          ],
          Symbol(isRawJson): true,
        },
      }
    `)
  })

  test('overrides', () => {
    const schema = buildUnoptimizedSchema(['testDataA', 'testRawJsonA'], {
      testDataA: {
        data: {
          properties: {
            a: {
              maximum: 3,
            },
          },
        },
      },
      testRawJsonA: {
        rawJson: {
          properties: {
            rawJsonA: {
              maximum: 5,
            },
          },
        },
      },
    })

    /* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any */

    const testDataASchemas = schema[200].oneOf.filter(
      (s: any) => s.properties?.kind?.const === 'testDataA'
    )
    expect(testDataASchemas).toHaveLength(1)
    expect(
      (testDataASchemas[0] as any).properties.data.properties.a.maximum
    ).toBe(3)

    const testRawJsonASchemas = schema[200].oneOf.filter(
      (s: any) => 'rawJsonA' in s.properties
    )
    expect(testRawJsonASchemas).toHaveLength(1)
    expect((testRawJsonASchemas[0] as any).properties.rawJsonA.maximum).toBe(5)

    /* eslint-enable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any */

    expect(schema).toMatchInlineSnapshot(`
      Object {
        "200": Object {
          "oneOf": Array [
            Object {
              "additionalProperties": false,
              "properties": Object {
                "data": Object {
                  "properties": Object {
                    "a": Object {
                      "maximum": 3,
                      "type": "integer",
                    },
                  },
                  "required": Array [
                    "a",
                  ],
                  "type": "object",
                },
                "kind": Object {
                  "const": "testDataA",
                  "type": "string",
                },
                "message": Object {
                  "const": "testDataAMessage",
                  "type": "string",
                },
              },
              "requiredProperties": Array [
                "kind",
                "message",
                "data",
              ],
              "type": "object",
            },
            Object {
              "properties": Object {
                "rawJsonA": Object {
                  "maximum": 5,
                  "type": "integer",
                },
              },
              "required": Array [
                "rawJsonA",
              ],
              "type": "object",
            },
          ],
          Symbol(isRawJson): true,
        },
      }
    `)
  })
})

describe('optimizeSchema', () => {
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
