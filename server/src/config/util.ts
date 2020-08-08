export const parseBoolEnv = (val: string): boolean => {
  return ['true', 'yes', 'y', '1'].includes(val.toLowerCase().trim())
}

export const makeNullsafe = <Arg, Ret>(f: (x: Arg) => Ret): (x: Arg | undefined) => Ret | undefined => {
  return x => (x === undefined) ? undefined : f(x)
}

export const nullsafeParseInt = makeNullsafe(parseInt)
export const nullsafeParseBoolEnv = makeNullsafe(parseBoolEnv)

const _removeUndefined = <T>(o: Record<string, T>): Record<string, T> | undefined => {
  let hasKeys = false
  for (const key of Object.keys(o)) {
    let v = o[key]
    if (typeof v === 'object' && v != null) {
      o[key] = v = _removeUndefined(v as Record<string, unknown>) as T
    }
    if (v === undefined || v === null) {
      delete o[key]
    } else {
      hasKeys = true
    }
  }
  return hasKeys ? o : undefined
}

export const removeUndefined = <T extends Record<string, unknown>>(o: T & Record<string, unknown>): T => {
  const cleaned = _removeUndefined(o) as T | undefined
  return cleaned ?? ({} as T)
}
