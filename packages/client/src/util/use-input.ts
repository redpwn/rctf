import { useState, useCallback, ChangeEvent } from 'react'

export const useInput = (
  initial: string
): [
  string,
  (e: ChangeEvent<HTMLInputElement>) => void,
  (val: string) => void
] => {
  const [val, setVal] = useState(initial)
  const updateVal = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setVal(e.target.value)
  }, [])

  return [val, updateVal, setVal]
}

export default useInput
