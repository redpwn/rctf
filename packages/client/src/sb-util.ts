import { Story } from '@storybook/react'

export type ExtractArgs<S> = S extends Story<infer Args> ? Args : S
export type AugmentArgs<S, Args> = Story<ExtractArgs<S> & Args>
export type OmitArgs<S, Keys extends keyof ExtractArgs<S>> = Story<Omit<ExtractArgs<S>, Keys>>
