export const parseBoolEnv = (val: string): boolean => {
  return ['true', 'yes', 'y', '1'].includes(val.toLowerCase().trim())
}

export const makeNullsafe = <Arg, Ret>(
  f: (x: Arg) => Ret
): ((x: Arg | undefined) => Ret | undefined) => {
  return x => (x === undefined ? undefined : f(x))
}

export const nullsafeParseInt = makeNullsafe(parseInt)
export const nullsafeParseBoolEnv = makeNullsafe(parseBoolEnv)
