import { PromiseValue } from 'type-fest'

type ArrayValue<Arr> = Arr extends (infer Val)[] ? Val : Arr

export type ExtractQueryType<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FuncType extends (...args: any) => any
> = NonNullable<ArrayValue<PromiseValue<ReturnType<FuncType>>>>
