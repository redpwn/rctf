import { PromiseValue } from 'type-fest'

type ArrayValue<Arr> = Arr extends (infer Val)[] ? Val : Arr

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExtractQueryType<FuncType extends (...args: any) => any> =
  NonNullable<ArrayValue<PromiseValue<ReturnType<FuncType>>>>
