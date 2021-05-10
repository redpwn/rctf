const fs = require('fs').promises
const path = require('path')
const walk = require('walkdir')
const yaml = require('yaml')
const prettier = require('prettier')
const { compile: schema2tsCompile } = require('json-schema-to-typescript')
const { all: deepmerge } = require('deepmerge')
const Ajv = require('ajv').default
const babel = require('@babel/core')

// camelCase / kebab-case / snake_case to PascalCase
const toPascalCase = name =>
  name.replace(
    /([a-zA-Z])([a-zA-Z0-9]*)[-_]?/g,
    (match, ch1, rest) => ch1.toUpperCase() + rest
  )
// PascalCase / kebab-case / snake_case to camelCase
const toCamelCase = name =>
  toPascalCase(name).replace(/^./, ch => ch.toLowerCase())

const strEnumToTs = strEnum => strEnum.map(e => `'${e}'`).join(' | ')

const makeSchemaModifier = (modifier, inPlace) => {
  inPlace = inPlace ?? false
  const doModify = schema => {
    schema = modifier(schema)
    if (schema.type === 'object' && schema.properties) {
      if (!inPlace) {
        schema.properties = { ...schema.properties }
      }
      for (const key of Object.keys(schema.properties)) {
        schema.properties[key] = doModify(schema.properties[key])
      }
    }
    if (schema.type === 'array') {
      if (schema.items instanceof Array) {
        schema.items = schema.items.map(doModify)
      } else {
        schema.items = doModify(schema.items)
      }
    }
    return schema
  }
  return doModify
}

const disallowAdditonalProperties = makeSchemaModifier(schema => {
  schema = { ...schema }
  if (schema.type === 'object') {
    if (!('additionalProperties' in schema)) {
      schema.additionalProperties = false
    }
  }
  return schema
})

const omit = (object, property) => {
  if (property instanceof Array) {
    let ret = object
    for (const prop of property) {
      ret = omit(ret, prop)
    }
    return ret
  }

  const ret = { ...object }
  delete ret[property]
  return ret
}

const normalizeOneOf = makeSchemaModifier(schema => {
  if (schema.oneOf) {
    const oneOf = schema.oneOf.map(subschema =>
      deepmerge([omit(schema, 'oneOf'), subschema])
    )
    if (
      schema.type === 'object' &&
      schema.properties &&
      schema.oneOf.every(
        subschema =>
          Object.keys(subschema).filter(k => k !== 'required').length === 0
      )
    ) {
      // oneOf is being used to select a (mostly) mutually-exclusive set of
      // properties - try to optimize the resultant schema by removing the
      // excluded properties from the oneOf cloned subschemas.

      const propertySet = schema.oneOf
        .map(s => s.required)
        .filter(e => e)
        .flat()
      oneOf.forEach(subschema => {
        subschema.properties = { ...subschema.properties }
        const currProperties = subschema.required
        for (const prop of propertySet) {
          if (!currProperties.includes(prop)) {
            delete subschema.properties[prop]
          }
        }
      })
    }
    return { oneOf }
  } else {
    return schema
  }
})

const trim = (parts, ...args) => {
  let templated = ''
  let i = 0
  for (; i < parts.length - 1; i++) {
    templated += parts[i] + args[i]
  }
  templated += parts[i]
  return templated.replace(/^[ \n]*\n(?=[^\n])|(?<=[^\n]\n)[\n ]*$/g, '')
}

;(async () => {
  const responseSchema = yaml.parse(
    await fs.readFile(path.resolve(__dirname, 'response.schema.yml'), 'utf8')
  )
  const routeConfigSchema = yaml.parse(
    await fs.readFile(path.resolve(__dirname, 'routeConfig.schema.yml'), 'utf8')
  )
  const permsSchema = yaml.parse(
    await fs.readFile(path.resolve(__dirname, 'perms.schema.yml'), 'utf8')
  )
  const routeSchema = yaml.parse(
    await fs.readFile(path.resolve(__dirname, 'route.schema.yml'), 'utf8')
  )

  const ajv = new Ajv({
    useDefaults: true,
    allErrors: true,
  })
  ajv.addKeyword('tsType')

  const responseValidator = ajv.compile(responseSchema)

  const prettierOpts = await prettier.resolveConfig()
  const compileOpts = {
    bannerComment: '',
    style: prettierOpts,
  }

  const makePrettierTag =
    parser =>
    (code, ...args) => {
      if (code instanceof Array) {
        // Tagged template literal
        let templated = ''
        let i = 0
        for (; i < code.length - 1; i++) {
          templated += code[i] + args[i]
        }
        templated += code[i]
        code = templated
      }
      return prettier.format(code, {
        ...prettierOpts,
        parser,
      })
    }

  const ts = makePrettierTag('typescript')
  const js = makePrettierTag('babel')

  const compile = (schema, name, opts) =>
    schema2tsCompile(
      JSON.parse(JSON.stringify(schema)),
      name,
      opts ? { ...compileOpts, ...opts } : compileOpts
    )

  const sourceRoot = path.resolve(__dirname, '../src')

  const findAndLoadSingleYaml = async name => {
    const foundFiles = (
      await Promise.all(
        ['yaml', 'yml']
          .map(ext => path.resolve(sourceRoot, `${name}.${ext}`))
          .map(async fpath => {
            try {
              await fs.stat(fpath)
              return fpath
            } catch {
              return false
            }
          })
      )
    ).filter(f => f)
    if (foundFiles.length > 1) {
      const err = `Conflicting ${name}.y(a)ml found!`
      console.error(err)
      throw new Error(err)
    } else if (foundFiles.length === 0) {
      const err = `No ${name}.y(a)ml found!`
      console.error(err)
      throw new Error(err)
    }
    return yaml.parse(await fs.readFile(foundFiles[0], 'utf8'))
  }

  // RESPONSES

  let responseGlobalTypes = ''

  const responseKindTypeName = 'ResponseKind'
  const responseKindType = ts`
    export type ${responseKindTypeName}<
      PayloadType = unknown,
      PayloadDataType = unknown,
    > = {
      status: number
      readonly __response_payload?: PayloadType
      readonly __response_payload_data?: PayloadDataType
    } & (
      | {
          message: string
          data?: object
        }
      | {
          rawJson: object
        }
      | {
          rawContentType: string
        }
    )
  `
  responseGlobalTypes += '\n' + responseKindType
  const getRespPayloadTypeTypeName = 'GetResponsePayloadType'
  const getRespPayloadTypeType = ts`
    export type ${getRespPayloadTypeTypeName}<
      Kind extends ${responseKindTypeName}<unknown, unknown>
    > = Kind extends ${responseKindTypeName}<infer PayloadType, unknown>
      ? PayloadType extends undefined
        ? never
        : PayloadType
      : never
  `
  responseGlobalTypes += '\n' + getRespPayloadTypeType
  const getRespPayloadDataTypeTypeName = 'GetResponsePayloadDataType'
  const getRespPayloadDataTypeType = ts`
    export type ${getRespPayloadDataTypeTypeName}<
      Kind extends ${responseKindTypeName}<unknown, unknown>
    > = Kind extends ${responseKindTypeName}<unknown, infer PayloadDataType>
      ? PayloadDataType extends undefined
        ? never
        : PayloadDataType
      : never
  `
  responseGlobalTypes += '\n' + getRespPayloadDataTypeType
  responseGlobalTypes = ts(responseGlobalTypes)

  const responseFiles = await walk.async(path.resolve(sourceRoot, 'responses'))

  const responseKindRegex = /([a-z][a-zA-Z]*)\.ya?ml/

  const loadResponseEntryFromFile = async file => {
    const responseKindMatch = responseKindRegex.exec(file)
    if (responseKindMatch == null) {
      return
    }

    const responseKind = responseKindMatch[1]

    const responseObj = yaml.parse(await fs.readFile(file, 'utf8'))

    if (!responseValidator(responseObj)) {
      console.error(`${responseKind} not valid:`)
      console.error(responseValidator.errors)
      console.error(responseObj)
      throw responseValidator.errors
    }

    if ('data' in responseObj) {
      responseObj.data = disallowAdditonalProperties(responseObj.data)
    }

    const responseTypeIdent = toPascalCase(responseKind)
    let responseDataTypeIdent = responseTypeIdent

    let hasPayload = false
    let hasPayloadData = false
    let tsDef = ''
    if ('rawJson' in responseObj) {
      tsDef += await compile(responseObj.rawJson, responseTypeIdent)
      hasPayload = true
      hasPayloadData = true
    }
    if ('data' in responseObj) {
      responseDataTypeIdent = responseTypeIdent + 'Data'
      tsDef += await compile(responseObj.data, responseDataTypeIdent)
      hasPayloadData = true
    }
    if ('message' in responseObj) {
      tsDef += '\n'
      tsDef += trim`
        export interface ${responseTypeIdent} {
          kind: '${responseKind}'
          message: string
      `
      if ('data' in responseObj) {
        tsDef += trim`
          data: ${responseTypeIdent}Data
        `
      }
      tsDef += trim`
        }
      `
      hasPayload = true
    }

    tsDef = ts(tsDef)

    const entry = {
      object: responseObj,
      hasPayload,
      hasPayloadData,
      payloadIdent: hasPayload ? responseTypeIdent : undefined,
      payloadDataIdent: hasPayloadData ? responseDataTypeIdent : undefined,
      tsDef,
    }

    if (!entry.tsDef) {
      delete entry.tsDef
    }

    return [responseKind, entry]
  }

  const responses = new Map(
    (await Promise.all(responseFiles.map(loadResponseEntryFromFile))).filter(
      e => e
    )
  )

  const responseKeys = [...responses.keys()].sort()

  // ROUTE CONFIG

  routeConfigSchema.properties.badAuthResponse.enum = responseKeys
  routeConfigSchema.properties.badPermsResponse.enum = responseKeys

  const routeConfigValidator = ajv.compile(routeConfigSchema)

  const routeConfig = await findAndLoadSingleYaml('routeConfig')
  if (!routeConfigValidator(routeConfig)) {
    console.error('routeConfig not valid:')
    console.error(routeConfigValidator.errors)
    console.error(routeConfig)
    throw routeConfigValidator.errors
  }

  // PERMISSIONS

  const permsConfig = await findAndLoadSingleYaml('perms')

  permsSchema.additionalProperties.oneOf[1].items.enum =
    Object.keys(permsConfig).sort()
  const permsValidator = ajv.compile(permsSchema)
  if (!permsValidator(permsConfig)) {
    console.error('perms not valid:')
    console.error(permsValidator.errors)
    console.error(permsConfig)
    throw permsValidator.errors
  }
  const permsMap = new Map()
  ;(() => {
    const toConcretize = Object.keys(permsConfig)
    while (toConcretize.length > 0) {
      const currLen = toConcretize.length
      for (let i = 0; i < currLen && toConcretize.length > 0; ++i) {
        const curr = toConcretize.shift()
        const val = permsConfig[curr]
        if (val instanceof Array) {
          let mask = 0
          let successful = true
          for (const key of val) {
            const v = permsMap.get(key)
            if (v !== undefined) {
              mask |= v
            } else {
              successful = false
              break
            }
          }
          if (successful) {
            permsMap.set(curr, mask)
          } else {
            toConcretize.push(curr)
          }
        } else {
          permsMap.set(curr, 1 << val)
        }
      }
      if (toConcretize.length === currLen) {
        console.error('perms not valid:')
        console.error('Reference loop detected:')
        console.error(toConcretize)
        throw new Error('Reference loop detected')
      }
    }
  })()

  let permsGlobalTypes = ''
  permsGlobalTypes += trim`
    export declare enum Permissions {
  `
  for (const [name, val] of permsMap.entries()) {
    permsGlobalTypes += trim`
      ${name} = ${val},
    `
  }
  permsGlobalTypes += trim`
    }

    export default Permissions
  `
  permsGlobalTypes = ts(permsGlobalTypes)

  // ROUTES

  routeSchema.properties.responses.items.enum = responseKeys
  routeSchema.properties.perms.items.enum = [...permsMap.keys()].sort()
  const routeValidator = ajv.compile(routeSchema)

  let routeGlobalTypes = ts`
    import { Responses, ResponsePayloads } from './responses'
  `

  const routeTypeName = 'Route'
  const _routeTypeResponseSymbol = '$$RESPONSE_TYPE$$'
  const _routeTypeRequireAuthSymbol = '$$REQUIRE_AUTH$$'
  const _routeSchemaForTypeCompilation = JSON.parse(
    JSON.stringify(disallowAdditonalProperties(routeSchema))
  )
  _routeSchemaForTypeCompilation.properties.responses.tsType =
    _routeTypeResponseSymbol
  _routeSchemaForTypeCompilation.properties.requireAuth.tsType =
    _routeTypeRequireAuthSymbol
  const _routeSchemaResponseKindsEnum = 'keyof Responses'
  const routeType = ts(
    (
      await compile(_routeSchemaForTypeCompilation, routeTypeName, {
        ignoreMinAndMaxItems: true,
      })
    )
      .replace(
        routeTypeName,
        `${routeTypeName}<
          ResponseKinds extends ${_routeSchemaResponseKindsEnum} = ${_routeSchemaResponseKindsEnum},
          BodyType = unknown,
          QSType = unknown,
          ParamsType = unknown,
          RequireAuth extends boolean = boolean,
        >`
      )
      .replace(_routeTypeResponseSymbol, `[ResponseKinds, ...ResponseKinds[]]`)
      .replace(_routeTypeRequireAuthSymbol, `RequireAuth`)
      .replace(/\}\s*$/, '') +
      '\n' +
      trim`
        readonly __body_type?: BodyType
        readonly __qs_type?: QSType
        readonly __params_type?: ParamsType
      }
      `
  )
  routeGlobalTypes += '\n' + routeType

  const getRouteBodyTypeTypeName = 'GetRouteBodyType'
  const getRouteBodyTypeType = ts`
    export type ${getRouteBodyTypeTypeName}<
      R extends ${routeTypeName}<any, unknown, unknown, unknown>
    > = R extends ${routeTypeName}<any, infer BodyType, unknown, unknown>
      ? BodyType extends undefined
        ? never
        : BodyType
      : never
  `
  routeGlobalTypes += '\n' + getRouteBodyTypeType

  const getRouteQSTypeTypeName = 'GetRouteQSType'
  const getRouteQSTypeType = ts`
    export type ${getRouteQSTypeTypeName}<
      R extends ${routeTypeName}<any, unknown, unknown, unknown>
    > = R extends ${routeTypeName}<any, unknown, infer QSType, unknown>
      ? QSType extends undefined
        ? never
        : QSType
      : never
  `
  routeGlobalTypes += '\n' + getRouteQSTypeType

  const getRouteParamsTypeTypeName = 'GetRouteParamsType'
  const getRouteParamsTypeType = ts`
    export type ${getRouteParamsTypeTypeName}<
      R extends ${routeTypeName}<any, unknown, unknown, unknown>
    > = R extends ${routeTypeName}<any, unknown, unknown, infer ParamsType>
      ? ParamsType extends undefined
        ? never
        : ParamsType
      : never
  `
  routeGlobalTypes += '\n' + getRouteParamsTypeType

  const getRouteResponseTypeTypeName = 'GetRouteResponseType'
  const getRouteResponseTypeType = ts`
    export type ${getRouteResponseTypeTypeName}<
      R extends ${routeTypeName}<any, unknown, unknown, unknown>
    > = R extends ${routeTypeName}<infer ResponseKinds, unknown, unknown, unknown>
      ? ResponsePayloads[ResponseKinds]
      : never
  `
  routeGlobalTypes += '\n' + getRouteResponseTypeType

  const getRouteResponseKindsTypeName = 'GetRouteResponseKinds'
  const getRouteResponseKindsType = ts`
    export type ${getRouteResponseKindsTypeName}<
      R extends ${routeTypeName}<any, unknown, unknown, unknown>
    > = R extends ${routeTypeName}<infer ResponseKinds, unknown, unknown, unknown>
      ? ResponseKinds
      : never
  `
  routeGlobalTypes += '\n' + getRouteResponseKindsType

  routeGlobalTypes = ts(routeGlobalTypes)

  const yamlExtRegex = /\.ya?ml$/
  const routeRoot = path.resolve(sourceRoot, 'routes')
  const routeFiles = (await walk.async(routeRoot)).filter(file =>
    yamlExtRegex.test(file)
  )

  const loadRouteFromFile = async file => {
    const routeObj = yaml.parse(await fs.readFile(file, 'utf8'))

    const routeIdent = toCamelCase(
      path
        .relative(routeRoot, file)
        .replace(/[/\\]/g, '-')
        .replace(yamlExtRegex, '')
    )

    if (!routeValidator(routeObj)) {
      console.error(`${file} not valid:`)
      console.error(routeValidator.errors)
      console.error(routeObj)
      throw routeValidator.errors
    }

    if (routeObj.requireAuth) {
      routeObj.responses.push(routeConfig.badAuthResponse)
      if (routeObj.perms) {
        routeObj.responses.push(routeConfig.badPermsResponse)
      }
    }

    const routeTypeIdentPrefix = toPascalCase(routeIdent) + 'Request'

    let tsDef = ''
    let routeTypeBodyType = 'never'
    let routeTypeQSType = 'never'
    let routeTypeParamsType = 'never'
    if (routeObj.schema) {
      if (routeObj.schema.body) {
        routeTypeBodyType = routeTypeIdentPrefix + 'Body'
        tsDef +=
          '\n' +
          (await compile(
            normalizeOneOf(disallowAdditonalProperties(routeObj.schema.body)),
            routeTypeBodyType
          ))
      }
      if (routeObj.schema.querystring) {
        routeTypeQSType = routeTypeIdentPrefix + 'QS'
        tsDef +=
          '\n' +
          (await compile(
            normalizeOneOf(
              disallowAdditonalProperties(routeObj.schema.querystring)
            ),
            routeTypeQSType
          ))
      }
      if (routeObj.schema.params) {
        routeObj.schema.params = disallowAdditonalProperties(
          routeObj.schema.params
        )
        routeTypeParamsType = routeTypeIdentPrefix + 'Params'
        tsDef +=
          '\n' +
          (await compile(
            normalizeOneOf(routeObj.schema.params),
            routeTypeParamsType
          ))
      }
    }

    tsDef = ts(tsDef)

    const typeDef = ts`
      type T = ${routeTypeName}<
        ${strEnumToTs(routeObj.responses)},
        ${routeTypeBodyType},
        ${routeTypeQSType},
        ${routeTypeParamsType},
        ${routeObj.requireAuth},
      >
    `.replace(/\s*type T =\s*/, '')

    const routeObjConcrete = { ...routeObj }
    if ('perms' in routeObjConcrete) {
      routeObjConcrete.perms = 0
      for (const role of routeObj.perms) {
        routeObjConcrete.perms |= permsMap.get(role)
      }
    }

    const entry = {
      object: routeObjConcrete,
      ident: routeIdent,
      typeDef,
      tsDef,
    }

    return entry
  }

  const routes = (await Promise.all(routeFiles.map(loadRouteFromFile))).sort(
    (a, b) => a.ident.localeCompare(b.ident)
  )

  // OUTPUT

  const outputRoot = path.resolve(__dirname, '..')

  const generatedHeader =
    js`
    /**
     * AUTO-GENERATED FILE, DO NOT EDIT!
     */
  ` + '\n'

  const babelNodeOpts = {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: true,
          },
        },
      ],
    ],
  }

  const emitJs = async (filename, esmCode) => {
    esmCode = js(generatedHeader + esmCode)
    return [
      [`${filename}.mjs`, esmCode],
      [
        `${filename}.js`,
        (
          await babel.transformAsync(esmCode, {
            ...babelNodeOpts,
            filename: `${filename}.js`,
          })
        ).code,
      ],
    ]
  }
  const emitDTs = async (filename, dTsCode) => {
    dTsCode = generatedHeader + dTsCode
    dTsCode = dTsCode.replace(/(export )(type|const|let) /g, '$1declare $2 ')
    dTsCode = ts(dTsCode)
    return [[`${filename}.d.ts`, dTsCode]]
  }

  let permissionsMJs = trim`
    export const Permissions = {
  `
  for (const [name, val] of permsMap.entries()) {
    permissionsMJs += trim`
      ${name}: ${val},
    `
  }
  permissionsMJs += trim`
    }

    export default Permissions
  `
  const permissionsDTs = permsGlobalTypes

  let responsesMJs = ''
  let responsesDTs = responseGlobalTypes
  for (const kind of responseKeys) {
    responsesDTs += '\n' + responses.get(kind).tsDef
  }
  responsesDTs += '\n'
  for (const kind of responseKeys) {
    const response = responses.get(kind)
    responsesDTs += ts`
      export declare const ${kind}: ${responseKindTypeName}<
        ${response.hasPayload ? response.payloadIdent : 'never'},
        ${response.hasPayloadData ? response.payloadDataIdent : 'never'}
      >
    `
    responsesMJs +=
      '\n' +
      js`
      export const ${kind} = ${JSON.stringify(response.object)}
      `
  }
  responsesDTs += '\n'
  responsesDTs += trim`
    export interface Responses {
  `
  for (const kind of responseKeys) {
    responsesDTs += trim`
      ${kind}: typeof ${kind}
    `
  }
  responsesDTs += trim`
    }
  `
  responsesDTs += '\n'
  responsesDTs += trim`
    export interface ResponsePayloads {
  `
  for (const kind of responseKeys) {
    const response = responses.get(kind)
    responsesDTs += trim`
      ${kind}: ${response.hasPayload ? response.payloadIdent : 'never'}
    `
  }
  responsesDTs += trim`
    }
  `

  let routesMJs = ''
  let routesDTs = routeGlobalTypes
  for (const route of routes) {
    routesDTs += '\n' + route.tsDef
  }
  routesDTs += '\n'
  for (const route of routes) {
    const routeTypeName = toPascalCase(route.ident) + 'Route'
    routesDTs +=
      '\n' +
      ts`
      export declare type ${routeTypeName} = ${route.typeDef.slice(0, -1)}
      export declare const ${route.ident}: ${routeTypeName}
      `
    routesMJs +=
      '\n' +
      js`
      export const ${route.ident} = ${JSON.stringify(route.object)}
      `
  }

  const routesDeclaredTypes = [
    ...routesDTs.matchAll(
      /export (declare )?(interface|type) ([A-Z][a-zA-Z0-9]*)+/g
    ),
  ].map(match => match[3])

  const indexMJs = ''
  let indexDTs = ''
  indexDTs += trim`
    export {
  `
  for (const type of routesDeclaredTypes) {
    indexDTs += `
      ${type},
    `
  }
  indexDTs += trim`
    } from './routes'
  `

  await Promise.all(
    (
      await Promise.all([
        emitJs('permissions', permissionsMJs),
        emitDTs('permissions', permissionsDTs),
        emitJs('responses', responsesMJs),
        emitDTs('responses', responsesDTs),
        emitJs('routes', routesMJs),
        emitDTs('routes', routesDTs),
        emitJs('index', indexMJs),
        emitDTs('index', indexDTs),
      ])
    )
      .flat()
      .map(([name, contents]) =>
        fs.writeFile(path.resolve(outputRoot, name), contents)
      )
  )
})().catch(err => {
  console.error('Exception occurred:')
  console.error(err)
  process.exit(1)
})
