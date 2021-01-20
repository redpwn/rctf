/**
 * Perform a deep-copy of a JSON-stringifiable object
 */
export const deepCopy = <T>(data: T): T => {
  return JSON.parse(JSON.stringify(data)) as T
}

// eslint-disable-next-line @typescript-eslint/ban-types,@typescript-eslint/no-explicit-any
export const omit = <T extends object, K extends keyof T>(
  object: T,
  props: K[] | K
): Omit<T, K> => {
  const cloned = { ...object }
  const propsArr = props instanceof Array ? props : [props]
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  propsArr.forEach(p => delete cloned[p])
  return cloned
}

const _removeUndefined = <T>(
  o: Record<string, T>
): Record<string, T> | undefined => {
  let hasKeys = false
  for (const key of Object.keys(o)) {
    let v = o[key]
    if (typeof v === 'object' && v != null) {
      o[key] = v = _removeUndefined(v as Record<string, unknown>) as T
    }
    if (v === undefined || v === null) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete o[key]
    } else {
      hasKeys = true
    }
  }
  return hasKeys ? o : undefined
}

export const removeUndefined = <T extends Record<string, unknown>>(
  o: T & Record<string, unknown>
): T => {
  const cleaned = _removeUndefined(o) as T | undefined
  return cleaned ?? ({} as T)
}
