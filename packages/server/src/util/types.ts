// Type used for compile-time checking of a type (static assert)
// https://github.com/microsoft/TypeScript/issues/18523#issuecomment-329979963
export type HasType<T, Q extends T> = Q
