import { FunctionComponent, useState, useCallback, useRef, useEffect, ChangeEvent } from 'react'
import TextInput from './textinput'
import { text, boolean, select } from '@storybook/addon-knobs'
import { Text } from 'theme-ui'

export default {
  title: 'TextInput',
  component: TextInput
}

export const Input: FunctionComponent = () =>
  <TextInput
    label={text('Label', 'Label')}
    disabled={boolean('Disabled', false)}
    error={text('Error', '')}
    showError={boolean('Show error', false)}
    type={select('Type', ['text', 'search', 'email', 'password', 'number', 'url'], 'text')}
    placeholder={text('Placeholder', '')}
  />

export const InputWithPlaceholder: FunctionComponent = () =>
  <TextInput
    label={text('Label', 'Label')}
    disabled={boolean('Disabled', false)}
    error={text('Error', '')}
    showError={boolean('Show error', false)}
    type={select('Type', ['text', 'search', 'email', 'password', 'number', 'url'], 'text')}
    placeholder={text('Placeholder', 'Placeholder text')}
  />

export const DisabledInput: FunctionComponent = () =>
  <TextInput disabled
    label={text('Label', 'Label')}
    value={text('Value', '')}
  />

export const InputWithError: FunctionComponent = () =>
  <TextInput label='Label' error />

export const InputShowingNativeValidationError: FunctionComponent = () =>
  <TextInput label='Label' type='email' showError value='notanemail' />

export const InputWithoutLabel: FunctionComponent = () =>
  <TextInput error={boolean('Error', false)} />

export const InputsStackedNoPadding: FunctionComponent = () =>
  <>
    <TextInput label={text('Label 1', 'Label 1')}/>
    <TextInput label={text('Label 2', 'Label 2')}/>
  </>

export const ControlledInput: FunctionComponent = () => {
  const [value, setValue] = useState('')
  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }, [])

  return (
    <>
      <TextInput label='Label' value={value} onChange={onChange}
        error={text('Error', '')}
        showError={boolean('Show error', false)}
        type={select('Type', ['text', 'search', 'email', 'password', 'number', 'url'], 'text')}
      />
      <Text pt={3}>You typed: {value}</Text>
    </>
  )
}

export const InputWithRef: FunctionComponent = () => {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = ref.current
    if (el) {
      const func = () => el.focus()
      const t = setTimeout(func, 100)
      return () => clearTimeout(t)
    }
  }, [ref])

  return (
    <TextInput label='Email' ref={ref} type='email' showError />
  )
}

export const InputWithPropPassthrough: FunctionComponent = () =>
  <TextInput label='Label' autoFocus />
