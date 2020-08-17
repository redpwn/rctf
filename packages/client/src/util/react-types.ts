import { RefObject } from 'react'

export type ExtractRefType<Props> =
  'ref' extends keyof Props
    ? Props extends { ref?: infer RefObjType }
      ? RefObjType extends RefObject<infer RefType>
        ? RefType
        : never
      : never
    : never
